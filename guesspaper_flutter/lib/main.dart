import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

const apiBaseUrl = String.fromEnvironment('API_BASE_URL');

void main() {
  runApp(const GuessPaperApp());
}

class GuessPaperApp extends StatefulWidget {
  const GuessPaperApp({super.key});

  @override
  State<GuessPaperApp> createState() => _GuessPaperAppState();
}

class _GuessPaperAppState extends State<GuessPaperApp> {
  ThemeMode mode = ThemeMode.dark;

  void toggleTheme() {
    setState(() {
      mode = mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
    });
  }

  @override
  Widget build(BuildContext context) {
    return AppScope(
      toggleTheme: toggleTheme,
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'GuessPaper AI',
        themeMode: mode,
        theme: AppTheme.light,
        darkTheme: AppTheme.dark,
        home: const LandingScreen(),
      ),
    );
  }
}

class AppScope extends InheritedWidget {
  const AppScope({required this.toggleTheme, required super.child, super.key});

  final VoidCallback toggleTheme;

  static AppScope of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<AppScope>()!;
  }

  @override
  bool updateShouldNotify(AppScope oldWidget) => false;
}

class AppTheme {
  static const primary = Color(0xff6366f1);
  static const accent = Color(0xff22d3ee);
  static const darkBg = Color(0xff0a0a0f);
  static const darkText = Color(0xfff8fafc);
  static const lightBg = Color(0xfff8fafc);
  static const lightText = Color(0xff0f172a);
  static const mutedDark = Color(0xff94a3b8);
  static const mutedLight = Color(0xff64748b);

  static ThemeData get dark => _theme(Brightness.dark, darkBg, darkText);
  static ThemeData get light => _theme(Brightness.light, lightBg, lightText);

  static ThemeData _theme(Brightness brightness, Color bg, Color fg) {
    final scheme = ColorScheme.fromSeed(
      seedColor: primary,
      brightness: brightness,
      primary: primary,
      secondary: accent,
      surface: bg,
    );
    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: scheme,
      scaffoldBackgroundColor: bg,
      fontFamily: 'Inter',
      textTheme: ThemeData(brightness: brightness).textTheme.apply(
            bodyColor: fg,
            displayColor: fg,
          ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: brightness == Brightness.dark
            ? Colors.white.withOpacity(.06)
            : Colors.white.withOpacity(.8),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: fg.withOpacity(.1)),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
      ),
    );
  }
}

class ApiClient {
  ApiClient._();

  static final ApiClient instance = ApiClient._();
  final http.Client _client = http.Client();
  String _cookie = '';

  String get base {
    if (apiBaseUrl.isNotEmpty) return apiBaseUrl.replaceAll(RegExp(r'/$'), '');
    return '';
  }

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    _cookie = prefs.getString('cookie') ?? '';
  }

  Future<void> _saveCookie() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('cookie', _cookie);
  }

  Uri uri(String path, [Map<String, String?> query = const {}]) {
    final clean = query.map((key, value) => MapEntry(key, value ?? ''))
      ..removeWhere((_, value) => value.isEmpty);
    if (base.isEmpty) return Uri(path: path, queryParameters: clean.isEmpty ? null : clean);
    return Uri.parse('$base$path').replace(queryParameters: clean.isEmpty ? null : clean);
  }

  Map<String, String> get headers => {
        'Content-Type': 'application/json',
        if (_cookie.isNotEmpty) 'Cookie': _cookie,
      };

  void _captureCookie(http.Response response) {
    final raw = response.headers['set-cookie'];
    if (raw == null || raw.isEmpty) return;
    final parts = raw
        .split(RegExp(r', (?=[^;,]+=)'))
        .map((part) => part.split(';').first.trim())
        .where((part) => part.isNotEmpty);
    final jar = <String, String>{};
    for (final item in _cookie.split(';')) {
      final pair = item.trim().split('=');
      if (pair.length >= 2) jar[pair.first] = pair.sublist(1).join('=');
    }
    for (final item in parts) {
      final pair = item.split('=');
      if (pair.length >= 2) jar[pair.first] = pair.sublist(1).join('=');
    }
    _cookie = jar.entries.map((e) => '${e.key}=${e.value}').join('; ');
    _saveCookie();
  }

  Future<dynamic> getJson(String path, [Map<String, String?> query = const {}]) async {
    final res = await _client.get(uri(path, query), headers: headers);
    _captureCookie(res);
    return _decode(res);
  }

  Future<dynamic> postJson(String path, Map<String, dynamic> body) async {
    final res = await _client.post(uri(path), headers: headers, body: jsonEncode(body));
    _captureCookie(res);
    return _decode(res);
  }

  Future<dynamic> patchJson(String path, Map<String, dynamic> body) async {
    final res = await _client.patch(uri(path), headers: headers, body: jsonEncode(body));
    _captureCookie(res);
    return _decode(res);
  }

  Future<dynamic> deleteJson(String path, [Map<String, String?> query = const {}]) async {
    final res = await _client.delete(uri(path, query), headers: headers);
    _captureCookie(res);
    return _decode(res);
  }

  Future<void> login(String email, String password) async {
    final csrf = await _client.get(uri('/api/auth/csrf'), headers: headers);
    _captureCookie(csrf);
    final token = (jsonDecode(csrf.body) as Map<String, dynamic>)['csrfToken'];
    final res = await _client.post(
      uri('/api/auth/callback/credentials', {'json': 'true'}),
      headers: {
        ...headers,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: {
        'csrfToken': '$token',
        'email': email,
        'password': password,
        'redirect': 'false',
        'callbackUrl': '$base/dashboard',
      },
    );
    _captureCookie(res);
    if (res.statusCode >= 400 || res.body.contains('CredentialsSignin')) {
      throw Exception('Invalid email or password');
    }
  }

  Future<void> logout() async {
    _cookie = '';
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('cookie');
  }

  dynamic _decode(http.Response response) {
    final body = response.body.isEmpty ? '{}' : response.body;
    final data = jsonDecode(body);
    if (response.statusCode >= 400) {
      final message = data is Map ? data['error'] ?? data['message'] : 'Request failed';
      throw Exception(message);
    }
    return data;
  }
}

class GradientScaffold extends StatelessWidget {
  const GradientScaffold({required this.child, this.appBar, super.key});

  final Widget child;
  final PreferredSizeWidget? appBar;

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: appBar,
      body: Container(
        decoration: BoxDecoration(
          color: Theme.of(context).scaffoldBackgroundColor,
          gradient: RadialGradient(
            center: const Alignment(-.8, -.8),
            radius: 1.2,
            colors: [
              AppTheme.primary.withOpacity(dark ? .22 : .15),
              Theme.of(context).scaffoldBackgroundColor,
            ],
          ),
        ),
        child: child,
      ),
    );
  }
}

class GlassCard extends StatelessWidget {
  const GlassCard({required this.child, this.padding = const EdgeInsets.all(20), super.key});

  final Widget child;
  final EdgeInsets padding;

  @override
  Widget build(BuildContext context) {
    final fg = Theme.of(context).textTheme.bodyMedium!.color!;
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: fg.withOpacity(Theme.of(context).brightness == Brightness.dark ? .05 : .06),
        border: Border.all(color: fg.withOpacity(.1)),
        borderRadius: BorderRadius.circular(24),
      ),
      child: child,
    );
  }
}

class Brand extends StatelessWidget {
  const Brand({this.size = 24, super.key});
  final double size;

  @override
  Widget build(BuildContext context) {
    return ShaderMask(
      shaderCallback: (rect) => const LinearGradient(
        colors: [AppTheme.primary, AppTheme.accent],
      ).createShader(rect),
      child: Text(
        'GuessPaper AI',
        style: TextStyle(fontSize: size, fontWeight: FontWeight.w800, color: Colors.white),
      ),
    );
  }
}

class LandingScreen extends StatelessWidget {
  const LandingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final features = [
      ('AI-Powered Generation', 'Smart analysis of curriculum and exam patterns.', Icons.psychology),
      ('100+ Universities', 'NUST, COMSATS, FAST, UET, Punjab University, and more.', Icons.school),
      ('Complete Papers', 'MCQs, short questions, long questions, topics, and tips.', Icons.description),
      ('Export & Save', 'Save papers and keep your study history available.', Icons.bookmark),
      ('Instant Results', 'Generate complete guess papers in seconds.', Icons.flash_on),
      ('Secure & Private', 'Protected account-based access.', Icons.shield),
    ];
    return GradientScaffold(
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 1100),
              child: Column(
                children: [
                  Row(
                    children: [
                      const Brand(),
                      const Spacer(),
                      IconButton(
                        tooltip: 'Theme',
                        onPressed: AppScope.of(context).toggleTheme,
                        icon: const Icon(Icons.brightness_6),
                      ),
                      TextButton(
                        onPressed: () => push(context, const LoginScreen()),
                        child: const Text('Login'),
                      ),
                      ElevatedButton(
                        onPressed: () => push(context, const SignupScreen()),
                        child: const Text('Sign Up'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 72),
                  Chip(
                    avatar: const Icon(Icons.auto_awesome, size: 18),
                    label: const Text('AI-Powered Exam Preparation'),
                    side: BorderSide(color: AppTheme.primary.withOpacity(.35)),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Generate Smart\nGuess Papers',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.displayMedium?.copyWith(
                          fontWeight: FontWeight.w900,
                          height: 1,
                        ),
                  ),
                  const SizedBox(height: 18),
                  Text(
                    'Select your university and course. Get AI-generated guess papers with MCQs, short and long questions, important topics, and study tips instantly.',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(color: muted(context)),
                  ),
                  const SizedBox(height: 28),
                  Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    alignment: WrapAlignment.center,
                    children: [
                      ElevatedButton(
                        onPressed: () => push(context, const SignupScreen()),
                        child: const Text('Get Started Free'),
                      ),
                      OutlinedButton(
                        onPressed: () => push(context, const LoginScreen()),
                        child: const Text('Login to Dashboard'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 42),
                  LayoutBuilder(
                    builder: (context, constraints) {
                      final cols = constraints.maxWidth > 850 ? 3 : constraints.maxWidth > 560 ? 2 : 1;
                      return GridView.count(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        crossAxisCount: cols,
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                        childAspectRatio: cols == 1 ? 2.6 : 1.5,
                        children: features
                            .map((f) => GlassCard(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(f.$3, color: AppTheme.primary, size: 34),
                                      const SizedBox(height: 14),
                                      Text(f.$1, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 17)),
                                      const SizedBox(height: 6),
                                      Text(f.$2, style: TextStyle(color: muted(context))),
                                    ],
                                  ),
                                ))
                            .toList(),
                      );
                    },
                  ),
                  const SizedBox(height: 36),
                  Text(
                    'Copyright 2026 GuessPaper AI. AI-assisted study tool, not official exam material.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: muted(context), fontSize: 12),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final email = TextEditingController(text: 'demo@guesspaper.pk');
  final password = TextEditingController(text: 'Demo@12345');
  var loading = false;
  String? error;

  Future<void> submit() async {
    setState(() {
      loading = true;
      error = null;
    });
    try {
      await ApiClient.instance.load();
      await ApiClient.instance.login(email.text.trim(), password.text);
      if (mounted) replace(context, const ShellScreen());
    } catch (e) {
      setState(() => error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AuthFrame(
      title: 'Welcome back! Sign in to continue.',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          field('Email', email, keyboardType: TextInputType.emailAddress),
          field('Password', password, obscureText: true),
          if (error != null) Text(error!, style: const TextStyle(color: Colors.redAccent)),
          const SizedBox(height: 8),
          ElevatedButton(onPressed: loading ? null : submit, child: Text(loading ? 'Signing in...' : 'Sign In')),
          const SizedBox(height: 16),
          GlassCard(
            padding: const EdgeInsets.all(14),
            child: Text(
              'Demo Accounts:\nStudent: demo@guesspaper.pk / Demo@12345\nAdmin: admin@guesspaper.pk / Admin@12345',
              style: TextStyle(color: muted(context), fontSize: 13),
            ),
          ),
          TextButton(
            onPressed: () => replace(context, const SignupScreen()),
            child: const Text('Do not have an account? Sign up'),
          ),
        ],
      ),
    );
  }
}

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final fields = {
    'fullName': TextEditingController(),
    'fatherName': TextEditingController(),
    'cnic': TextEditingController(),
    'email': TextEditingController(),
    'profileImage': TextEditingController(),
    'password': TextEditingController(),
    'confirmPassword': TextEditingController(),
  };
  var loading = false;
  String? error;

  Future<void> submit() async {
    setState(() {
      loading = true;
      error = null;
    });
    try {
      await ApiClient.instance.postJson('/api/auth/signup', {
        for (final entry in fields.entries) entry.key: entry.value.text.trim(),
      });
      if (mounted) replace(context, const LoginScreen());
    } catch (e) {
      setState(() => error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AuthFrame(
      title: 'Create your student account',
      maxWidth: 560,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          field('Full Name', fields['fullName']!),
          field('Father Name', fields['fatherName']!),
          field('CNIC (XXXXX-XXXXXXX-X)', fields['cnic']!),
          field('Email', fields['email']!, keyboardType: TextInputType.emailAddress),
          field('Profile Picture URL (optional)', fields['profileImage']!),
          field('Password', fields['password']!, obscureText: true),
          field('Confirm Password', fields['confirmPassword']!, obscureText: true),
          if (error != null) Text(error!, style: const TextStyle(color: Colors.redAccent)),
          const SizedBox(height: 8),
          ElevatedButton(onPressed: loading ? null : submit, child: Text(loading ? 'Creating account...' : 'Create Account')),
          TextButton(
            onPressed: () => replace(context, const LoginScreen()),
            child: const Text('Already have an account? Sign in'),
          ),
        ],
      ),
    );
  }
}

class AuthFrame extends StatelessWidget {
  const AuthFrame({required this.title, required this.child, this.maxWidth = 440, super.key});

  final String title;
  final Widget child;
  final double maxWidth;

  @override
  Widget build(BuildContext context) {
    return GradientScaffold(
      child: SafeArea(
        child: Stack(
          children: [
            Positioned(
              right: 16,
              top: 8,
              child: IconButton(
                onPressed: AppScope.of(context).toggleTheme,
                icon: const Icon(Icons.brightness_6),
              ),
            ),
            Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: ConstrainedBox(
                  constraints: BoxConstraints(maxWidth: maxWidth),
                  child: GlassCard(
                    padding: const EdgeInsets.all(28),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Brand(size: 28),
                        const SizedBox(height: 10),
                        Text(title, textAlign: TextAlign.center, style: TextStyle(color: muted(context))),
                        const SizedBox(height: 26),
                        child,
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ShellScreen extends StatefulWidget {
  const ShellScreen({super.key});

  @override
  State<ShellScreen> createState() => _ShellScreenState();
}

class _ShellScreenState extends State<ShellScreen> {
  var index = 0;
  Map<String, dynamic>? profile;

  final labels = const ['Dashboard', 'Generate', 'History', 'Saved', 'Settings'];
  final icons = const [Icons.dashboard, Icons.description, Icons.history, Icons.bookmark, Icons.settings];

  @override
  void initState() {
    super.initState();
    ApiClient.instance.load().then((_) => refreshProfile());
  }

  Future<void> refreshProfile() async {
    try {
      final data = await ApiClient.instance.getJson('/api/users/profile');
      if (mounted) setState(() => profile = data);
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      DashboardScreen(profile: profile, goGenerate: () => setState(() => index = 1)),
      const GenerateScreen(),
      const HistoryScreen(),
      const SavedScreen(),
      SettingsScreen(profile: profile, onUpdated: refreshProfile),
    ];
    final wide = MediaQuery.sizeOf(context).width >= 900;
    return GradientScaffold(
      child: SafeArea(
        child: Row(
          children: [
            if (wide)
              NavigationRail(
                extended: true,
                selectedIndex: index,
                onDestinationSelected: (value) => setState(() => index = value),
                leading: const Padding(padding: EdgeInsets.all(16), child: Brand()),
                trailing: Expanded(
                  child: Align(
                    alignment: Alignment.bottomCenter,
                    child: TextButton.icon(
                      onPressed: () async {
                        await ApiClient.instance.logout();
                        if (mounted) replace(context, const LandingScreen());
                      },
                      icon: const Icon(Icons.logout),
                      label: const Text('Logout'),
                    ),
                  ),
                ),
                destinations: [
                  for (var i = 0; i < labels.length; i++)
                    NavigationRailDestination(icon: Icon(icons[i]), label: Text(labels[i])),
                ],
              ),
            Expanded(
              child: Column(
                children: [
                  AppBar(
                    backgroundColor: Colors.transparent,
                    elevation: 0,
                    title: wide ? null : const Brand(size: 20),
                    actions: [
                      IconButton(onPressed: AppScope.of(context).toggleTheme, icon: const Icon(Icons.brightness_6)),
                      const SizedBox(width: 8),
                    ],
                  ),
                  Expanded(child: pages[index]),
                  if (!wide)
                    NavigationBar(
                      selectedIndex: index,
                      onDestinationSelected: (value) => setState(() => index = value),
                      destinations: [
                        for (var i = 0; i < labels.length; i++)
                          NavigationDestination(icon: Icon(icons[i]), label: labels[i]),
                      ],
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({required this.profile, required this.goGenerate, super.key});

  final Map<String, dynamic>? profile;
  final VoidCallback goGenerate;

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  List<dynamic> recent = [];

  @override
  void initState() {
    super.initState();
    ApiClient.instance.getJson('/api/papers').then((data) {
      if (mounted && data is List) setState(() => recent = data.take(5).toList());
    }).catchError((_) {});
  }

  @override
  Widget build(BuildContext context) {
    final count = widget.profile?['_count'] ?? {};
    final name = '${widget.profile?['fullName'] ?? 'Student'}'.split(' ').first;
    final stats = [
      ('Papers Generated', '${count['papers'] ?? 0}', Icons.description, AppTheme.primary),
      ('Saved Papers', '${count['savedPapers'] ?? 0}', Icons.bookmark, AppTheme.accent),
      ('Notifications', '${count['notifications'] ?? 0}', Icons.notifications, Colors.amber),
      ('AI Status', 'Ready', Icons.auto_awesome, Colors.greenAccent),
    ];
    return pagePad(
      context,
      Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Welcome back, $name!', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w800)),
          Text('Generate AI-powered guess papers for your university courses.', style: TextStyle(color: muted(context))),
          const SizedBox(height: 22),
          Wrap(
            spacing: 14,
            runSpacing: 14,
            children: stats
                .map((s) => SizedBox(
                      width: 245,
                      child: GlassCard(
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(s.$1, style: TextStyle(color: muted(context))),
                                  Text(s.$2, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800)),
                                ],
                              ),
                            ),
                            Icon(s.$3, color: s.$4, size: 34),
                          ],
                        ),
                      ),
                    ))
                .toList(),
          ),
          const SizedBox(height: 18),
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Quick Generate', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 19)),
                const SizedBox(height: 6),
                Text('Select your university and course to generate a complete guess paper instantly.', style: TextStyle(color: muted(context))),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  onPressed: widget.goGenerate,
                  icon: const Icon(Icons.auto_awesome),
                  label: const Text('Generate Guess Paper'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          const Text('Recent Activity', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 19)),
          const SizedBox(height: 10),
          if (recent.isEmpty)
            GlassCard(child: Text('No papers generated yet. Start now!', style: TextStyle(color: muted(context))))
          else
            ...recent.map((paper) => PaperTile(paper: paper, onView: () => push(context, PaperScreen(paper: paper)))),
        ],
      ),
    );
  }
}

class GenerateScreen extends StatefulWidget {
  const GenerateScreen({super.key});

  @override
  State<GenerateScreen> createState() => _GenerateScreenState();
}

class _GenerateScreenState extends State<GenerateScreen> {
  List<dynamic> universities = [];
  List<dynamic> courses = [];
  String? universityId;
  String? courseId;
  Map<String, dynamic>? paper;
  var loading = false;
  String? error;

  @override
  void initState() {
    super.initState();
    searchUniversities('');
  }

  Future<void> searchUniversities(String query) async {
    final data = await ApiClient.instance.getJson('/api/universities', {'search': query});
    if (mounted && data is List) setState(() => universities = data);
  }

  Future<void> searchCourses(String query) async {
    if (universityId == null) return;
    final data = await ApiClient.instance.getJson('/api/courses', {'universityId': universityId, 'search': query});
    if (mounted && data is List) setState(() => courses = data);
  }

  Future<void> generate() async {
    if (universityId == null || courseId == null) return;
    setState(() {
      loading = true;
      paper = null;
      error = null;
    });
    try {
      final data = await ApiClient.instance.postJson('/api/papers', {'universityId': universityId, 'courseId': courseId});
      if (mounted) setState(() => paper = Map<String, dynamic>.from(data));
    } catch (e) {
      setState(() => error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return pagePad(
      context,
      Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Generate Guess Paper', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w800)),
          Text('Select university and course to generate your AI-powered guess paper.', style: TextStyle(color: muted(context))),
          const SizedBox(height: 18),
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Select University & Course', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 19)),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  value: universityId,
                  decoration: const InputDecoration(labelText: 'University'),
                  items: universities.map((u) => DropdownMenuItem<String>(value: u['id'], child: Text('${u['name']}'))).toList(),
                  onChanged: (value) {
                    setState(() {
                      universityId = value;
                      courseId = null;
                      courses = [];
                    });
                    searchCourses('');
                  },
                ),
                const SizedBox(height: 14),
                DropdownButtonFormField<String>(
                  value: courseId,
                  decoration: const InputDecoration(labelText: 'Course'),
                  items: courses.map((c) => DropdownMenuItem<String>(value: c['id'], child: Text('${c['name']}'))).toList(),
                  onChanged: (value) => setState(() => courseId = value),
                ),
                const SizedBox(height: 16),
                if (error != null) Text(error!, style: const TextStyle(color: Colors.redAccent)),
                ElevatedButton.icon(
                  onPressed: loading ? null : generate,
                  icon: loading
                      ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Icon(Icons.auto_awesome),
                  label: Text(loading ? 'Generating...' : 'Generate Guess Paper'),
                ),
              ],
            ),
          ),
          if (paper != null) ...[
            const SizedBox(height: 20),
            PaperViewer(paper: paper!, canRegenerate: true, onRegenerate: generate),
          ],
        ],
      ),
    );
  }
}

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  List<dynamic> papers = [];
  final search = TextEditingController();

  @override
  void initState() {
    super.initState();
    load();
  }

  Future<void> load() async {
    final data = await ApiClient.instance.getJson('/api/papers', {'search': search.text});
    if (mounted && data is List) setState(() => papers = data);
  }

  @override
  Widget build(BuildContext context) {
    return pagePad(
      context,
      Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Paper History', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w800)),
          const SizedBox(height: 14),
          TextField(
            controller: search,
            decoration: const InputDecoration(prefixIcon: Icon(Icons.search), hintText: 'Search papers...'),
            onSubmitted: (_) => load(),
          ),
          const SizedBox(height: 14),
          if (papers.isEmpty)
            GlassCard(child: Text('No papers found. Generate your first guess paper!', style: TextStyle(color: muted(context))))
          else
            ...papers.map((paper) => PaperTile(paper: paper, onView: () => push(context, PaperScreen(paper: paper)))),
        ],
      ),
    );
  }
}

class SavedScreen extends StatefulWidget {
  const SavedScreen({super.key});

  @override
  State<SavedScreen> createState() => _SavedScreenState();
}

class _SavedScreenState extends State<SavedScreen> {
  List<dynamic> saved = [];

  @override
  void initState() {
    super.initState();
    load();
  }

  Future<void> load() async {
    final data = await ApiClient.instance.getJson('/api/papers/save');
    if (mounted && data is List) setState(() => saved = data);
  }

  @override
  Widget build(BuildContext context) {
    return pagePad(
      context,
      Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Saved Papers', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w800)),
          const SizedBox(height: 14),
          if (saved.isEmpty)
            GlassCard(child: Center(child: Text('No saved papers yet.', style: TextStyle(color: muted(context)))))
          else
            ...saved.map((item) {
              final paper = item['paper'];
              return PaperTile(paper: paper, onView: () => push(context, PaperScreen(paper: paper)));
            }),
        ],
      ),
    );
  }
}

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({required this.profile, required this.onUpdated, super.key});

  final Map<String, dynamic>? profile;
  final Future<void> Function() onUpdated;

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final fullName = TextEditingController();
  final fatherName = TextEditingController();
  final cnic = TextEditingController();
  final email = TextEditingController();
  final profileImage = TextEditingController();
  final currentPassword = TextEditingController();
  final newPassword = TextEditingController();
  final confirmPassword = TextEditingController();
  String? message;

  @override
  void didUpdateWidget(covariant SettingsScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    final p = widget.profile;
    if (p == null || oldWidget.profile == p) return;
    fullName.text = '${p['fullName'] ?? ''}';
    fatherName.text = '${p['fatherName'] ?? ''}';
    cnic.text = '${p['cnic'] ?? ''}';
    email.text = '${p['email'] ?? ''}';
    profileImage.text = '${p['profileImage'] ?? ''}';
  }

  Future<void> saveProfile() async {
    try {
      await ApiClient.instance.patchJson('/api/users/profile', {
        'fullName': fullName.text,
        'fatherName': fatherName.text,
        'cnic': cnic.text,
        'email': email.text,
        'profileImage': profileImage.text,
      });
      await widget.onUpdated();
      setState(() => message = 'Profile updated successfully');
    } catch (e) {
      setState(() => message = e.toString().replaceFirst('Exception: ', ''));
    }
  }

  Future<void> savePassword() async {
    try {
      await ApiClient.instance.patchJson('/api/users/profile', {
        'currentPassword': currentPassword.text,
        'newPassword': newPassword.text,
        'confirmPassword': confirmPassword.text,
      });
      setState(() => message = 'Password updated successfully');
    } catch (e) {
      setState(() => message = e.toString().replaceFirst('Exception: ', ''));
    }
  }

  @override
  Widget build(BuildContext context) {
    return pagePad(
      context,
      Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Settings', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w800)),
          if (message != null) Padding(padding: const EdgeInsets.symmetric(vertical: 8), child: Text(message!)),
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text('Profile', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 19)),
                field('Profile Image URL', profileImage),
                field('Full Name', fullName),
                field('Father Name', fatherName),
                field('CNIC', cnic),
                field('Email', email),
                ElevatedButton(onPressed: saveProfile, child: const Text('Save Profile')),
              ],
            ),
          ),
          const SizedBox(height: 16),
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text('Change Password', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 19)),
                field('Current Password', currentPassword, obscureText: true),
                field('New Password', newPassword, obscureText: true),
                field('Confirm Password', confirmPassword, obscureText: true),
                ElevatedButton(onPressed: savePassword, child: const Text('Update Password')),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class PaperScreen extends StatelessWidget {
  const PaperScreen({required this.paper, super.key});

  final dynamic paper;

  @override
  Widget build(BuildContext context) {
    return GradientScaffold(
      appBar: AppBar(title: const Text('Guess Paper'), backgroundColor: Colors.transparent),
      child: pagePad(context, PaperViewer(paper: Map<String, dynamic>.from(paper))),
    );
  }
}

class PaperViewer extends StatefulWidget {
  const PaperViewer({required this.paper, this.canRegenerate = false, this.onRegenerate, super.key});

  final Map<String, dynamic> paper;
  final bool canRegenerate;
  final Future<void> Function()? onRegenerate;

  @override
  State<PaperViewer> createState() => _PaperViewerState();
}

class _PaperViewerState extends State<PaperViewer> {
  String? status;

  Future<void> save() async {
    await ApiClient.instance.postJson('/api/papers/save', {'paperId': widget.paper['id']});
    setState(() => status = 'Saved');
  }

  Future<void> download() async {
    final text = paperToText(widget.paper);
    final uri = Uri.dataFromString(text, mimeType: 'text/plain', encoding: utf8);
    await launchUrl(uri);
  }

  @override
  Widget build(BuildContext context) {
    final content = Map<String, dynamic>.from(widget.paper['content'] ?? {});
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Wrap(
          spacing: 8,
          runSpacing: 8,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            SizedBox(
              width: 420,
              child: Text('${widget.paper['title']}', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800)),
            ),
            if (widget.canRegenerate && widget.onRegenerate != null)
              OutlinedButton.icon(onPressed: widget.onRegenerate, icon: const Icon(Icons.refresh), label: const Text('Regenerate')),
            OutlinedButton.icon(onPressed: save, icon: const Icon(Icons.bookmark), label: Text(status ?? 'Save')),
            OutlinedButton.icon(onPressed: download, icon: const Icon(Icons.download), label: const Text('Download')),
          ],
        ),
        const SizedBox(height: 16),
        sectionCard(context, content['sectionA'], (section) {
          final mcqs = List<dynamic>.from(section['mcqs'] ?? []);
          return Column(
            children: [
              for (var i = 0; i < mcqs.length; i++)
                GlassCard(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('${i + 1}. ${mcqs[i]['question']}', style: const TextStyle(fontWeight: FontWeight.w700)),
                      const SizedBox(height: 8),
                      for (final opt in List<dynamic>.from(mcqs[i]['options'] ?? [])) Text('$opt', style: TextStyle(color: muted(context))),
                      Text('Answer: ${mcqs[i]['answer']}', style: const TextStyle(color: Colors.greenAccent, fontSize: 12)),
                    ],
                  ),
                ),
            ],
          );
        }),
        sectionCard(context, content['sectionB'], questions),
        sectionCard(context, content['sectionC'], questions),
        sectionCard(context, content['sectionD'], (section) {
          final topics = List<dynamic>.from(section['topics'] ?? []);
          return Wrap(
            spacing: 10,
            runSpacing: 10,
            children: topics
                .map((t) => SizedBox(
                      width: 300,
                      child: GlassCard(
                        padding: const EdgeInsets.all(14),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('${t['topic']}', style: const TextStyle(fontWeight: FontWeight.w700)),
                            Text('${t['probability']}', style: const TextStyle(color: Colors.amber)),
                            Text('${t['notes']}', style: TextStyle(color: muted(context))),
                          ],
                        ),
                      ),
                    ))
                .toList(),
          );
        }),
        sectionCard(context, content['sectionE'], (section) {
          final tips = List<dynamic>.from(section['tips'] ?? []);
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: tips.map((tip) => Padding(padding: const EdgeInsets.only(bottom: 8), child: Text('- $tip'))).toList(),
          );
        }),
      ],
    );
  }
}

Widget sectionCard(BuildContext context, dynamic raw, Widget Function(Map<String, dynamic>) builder) {
  final section = Map<String, dynamic>.from(raw ?? {});
  return Padding(
    padding: const EdgeInsets.only(bottom: 16),
    child: GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('${section['title'] ?? ''}', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 19)),
          const SizedBox(height: 12),
          builder(section),
        ],
      ),
    ),
  );
}

Widget questions(Map<String, dynamic> section) {
  final items = List<dynamic>.from(section['questions'] ?? []);
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (var i = 0; i < items.length; i++)
        Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Text('${i + 1}. ${items[i]}'),
        ),
    ],
  );
}

class PaperTile extends StatelessWidget {
  const PaperTile({required this.paper, required this.onView, super.key});

  final dynamic paper;
  final VoidCallback onView;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: GlassCard(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('${paper['title']}', style: const TextStyle(fontWeight: FontWeight.w700)),
                  Text(
                    '${paper['university']?['name'] ?? ''} ${paper['course']?['name'] ?? ''}',
                    style: TextStyle(color: muted(context), fontSize: 12),
                  ),
                ],
              ),
            ),
            OutlinedButton.icon(onPressed: onView, icon: const Icon(Icons.visibility), label: const Text('View')),
          ],
        ),
      ),
    );
  }
}

Widget field(
  String label,
  TextEditingController controller, {
  bool obscureText = false,
  TextInputType? keyboardType,
}) {
  return Padding(
    padding: const EdgeInsets.only(bottom: 14),
    child: TextField(
      controller: controller,
      obscureText: obscureText,
      keyboardType: keyboardType,
      decoration: InputDecoration(labelText: label),
    ),
  );
}

Widget pagePad(BuildContext context, Widget child) {
  return SingleChildScrollView(
    padding: const EdgeInsets.all(24),
    child: Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 1100),
        child: child,
      ),
    ),
  );
}

Color muted(BuildContext context) {
  return Theme.of(context).brightness == Brightness.dark ? AppTheme.mutedDark : AppTheme.mutedLight;
}

void push(BuildContext context, Widget page) {
  Navigator.of(context).push(MaterialPageRoute(builder: (_) => page));
}

void replace(BuildContext context, Widget page) {
  Navigator.of(context).pushAndRemoveUntil(MaterialPageRoute(builder: (_) => page), (_) => false);
}

String paperToText(Map<String, dynamic> paper) {
  final b = StringBuffer('${paper['title']}\n\n');
  final content = Map<String, dynamic>.from(paper['content'] ?? {});
  for (final key in ['sectionA', 'sectionB', 'sectionC', 'sectionD', 'sectionE']) {
    final section = Map<String, dynamic>.from(content[key] ?? {});
    b.writeln(section['title'] ?? '');
    if (section['mcqs'] is List) {
      for (final mcq in section['mcqs']) {
        b.writeln('${mcq['question']}');
        for (final opt in List<dynamic>.from(mcq['options'] ?? [])) {
          b.writeln('  $opt');
        }
        b.writeln('Answer: ${mcq['answer']}');
      }
    }
    for (final q in List<dynamic>.from(section['questions'] ?? [])) {
      b.writeln('- $q');
    }
    for (final topic in List<dynamic>.from(section['topics'] ?? [])) {
      b.writeln('- ${topic['topic']} [${topic['probability']}] ${topic['notes']}');
    }
    for (final tip in List<dynamic>.from(section['tips'] ?? [])) {
      b.writeln('- $tip');
    }
    b.writeln();
  }
  return b.toString();
}
