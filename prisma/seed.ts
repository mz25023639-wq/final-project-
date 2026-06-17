import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const UNIVERSITIES = [
  { name: "NUST", city: "Islamabad" },
  { name: "COMSATS University", city: "Islamabad" },
  { name: "FAST National University", city: "Islamabad" },
  { name: "UET Lahore", city: "Lahore" },
  { name: "Air University", city: "Islamabad" },
  { name: "Bahria University", city: "Islamabad" },
  { name: "University of Punjab", city: "Lahore" },
  { name: "Arid Agriculture University", city: "Rawalpindi" },
  { name: "Virtual University", city: "Lahore" },
  { name: "Iqra University", city: "Karachi" },
  { name: "NED University", city: "Karachi" },
  { name: "IBA Karachi", city: "Karachi" },
  { name: "LUMS", city: "Lahore" },
  { name: "GC University Lahore", city: "Lahore" },
  { name: "University of Karachi", city: "Karachi" },
  { name: "Quaid-e-Azam University", city: "Islamabad" },
  { name: "International Islamic University", city: "Islamabad" },
  { name: "Hazara University", city: "Mansehra" },
  { name: "University of Peshawar", city: "Peshawar" },
  { name: "University of Engineering & Technology Taxila", city: "Taxila" },
  { name: "GIKI", city: "Topi" },
  { name: "University of Sargodha", city: "Sargodha" },
  { name: "University of Gujrat", city: "Gujrat" },
  { name: "University of Agriculture Faisalabad", city: "Faisalabad" },
  { name: "University of Central Punjab", city: "Lahore" },
  { name: "Superior University", city: "Lahore" },
  { name: "Riphah International University", city: "Islamabad" },
  { name: "National University of Modern Languages", city: "Islamabad" },
  { name: "University of Management & Technology", city: "Lahore" },
  { name: "University of Lahore", city: "Lahore" },
  { name: "University of South Asia", city: "Lahore" },
  { name: "University of Faisalabad", city: "Faisalabad" },
  { name: "University of Education", city: "Lahore" },
  { name: "University of Malakand", city: "Malakand" },
  { name: "University of Swat", city: "Swat" },
  { name: "University of Swabi", city: "Swabi" },
  { name: "University of Haripur", city: "Haripur" },
  { name: "University of Buner", city: "Buner" },
  { name: "University of Chitral", city: "Chitral" },
  { name: "University of Lakki Marwat", city: "Lakki Marwat" },
  { name: "University of Bannu", city: "Bannu" },
  { name: "University of Kohat", city: "Kohat" },
  { name: "University of Mardan", city: "Mardan" },
  { name: "University of Abbottabad", city: "Abbottabad" },
  { name: "University of Mansehra", city: "Mansehra" },
  { name: "University of Dir", city: "Dir" },
  { name: "University of Shangla", city: "Shangla" },
  { name: "University of Battagram", city: "Battagram" },
  { name: "University of Torghar", city: "Torghar" },
  { name: "University of Upper Dir", city: "Upper Dir" },
  { name: "University of Lower Dir", city: "Lower Dir" },
  { name: "University of Bajaur", city: "Bajaur" },
  { name: "University of Mohmand", city: "Mohmand" },
  { name: "University of Khyber", city: "Peshawar" },
  { name: "University of Tribal Areas", city: "Peshawar" },
  { name: "University of Nowshera", city: "Nowshera" },
  { name: "University of Charsadda", city: "Charsadda" },
  { name: "University of Swabi Valley", city: "Swabi" },
  { name: "University of Islamabad", city: "Islamabad" },
  { name: "University of Rawalpindi", city: "Rawalpindi" },
  { name: "University of Multan", city: "Multan" },
  { name: "University of Bahawalpur", city: "Bahawalpur" },
  { name: "University of Dera Ghazi Khan", city: "Dera Ghazi Khan" },
  { name: "University of Sahiwal", city: "Sahiwal" },
  { name: "University of Okara", city: "Okara" },
  { name: "University of Vehari", city: "Vehari" },
  { name: "University of Khanewal", city: "Khanewal" },
  { name: "University of Lodhran", city: "Lodhran" },
  { name: "University of Muzaffargarh", city: "Muzaffargarh" },
  { name: "University of Rajanpur", city: "Rajanpur" },
  { name: "University of Layyah", city: "Layyah" },
  { name: "University of Bhakkar", city: "Bhakkar" },
  { name: "University of Mianwali", city: "Mianwali" },
  { name: "University of Khushab", city: "Khushab" },
  { name: "University of Jhelum", city: "Jhelum" },
  { name: "University of Chakwal", city: "Chakwal" },
  { name: "University of Attock", city: "Attock" },
  { name: "University of Talagang", city: "Talagang" },
  { name: "University of Murree", city: "Murree" },
  { name: "University of Gilgit", city: "Gilgit" },
  { name: "University of Skardu", city: "Skardu" },
  { name: "University of Hunza", city: "Hunza" },
  { name: "University of Nagar", city: "Nagar" },
  { name: "University of Ghizer", city: "Ghizer" },
  { name: "University of Astore", city: "Astore" },
  { name: "University of Diamer", city: "Diamer" },
  { name: "University of Ghanche", city: "Ghanche" },
  { name: "University of Shigar", city: "Shigar" },
  { name: "University of Kharmang", city: "Kharmang" },
  { name: "University of Roundu", city: "Roundu" },
  { name: "University of Hyderabad", city: "Hyderabad" },
  { name: "University of Sukkur", city: "Sukkur" },
  { name: "University of Larkana", city: "Larkana" },
  { name: "University of Nawabshah", city: "Nawabshah" },
  { name: "University of Mirpurkhas", city: "Mirpurkhas" },
  { name: "University of Thatta", city: "Thatta" },
  { name: "University of Badin", city: "Badin" },
  { name: "University of Sanghar", city: "Sanghar" },
  { name: "University of Khairpur", city: "Khairpur" },
  { name: "University of Jacobabad", city: "Jacobabad" },
  { name: "University of Shikarpur", city: "Shikarpur" },
  { name: "University of Ghotki", city: "Ghotki" },
  { name: "University of Dadu", city: "Dadu" },
  { name: "University of Jamshoro", city: "Jamshoro" },
  { name: "University of Matiari", city: "Matiari" },
  { name: "University of Tando Allahyar", city: "Tando Allahyar" },
  { name: "University of Tando Muhammad Khan", city: "Tando Muhammad Khan" },
  { name: "University of Umerkot", city: "Umerkot" },
  { name: "University of Tharparkar", city: "Tharparkar" },
  { name: "University of Quetta", city: "Quetta" },
  { name: "University of Turbat", city: "Turbat" },
  { name: "University of Gwadar", city: "Gwadar" },
  { name: "University of Khuzdar", city: "Khuzdar" },
  { name: "University of Loralai", city: "Loralai" },
  { name: "University of Zhob", city: "Zhob" },
  { name: "University of Sibi", city: "Sibi" },
  { name: "University of Mastung", city: "Mastung" },
  { name: "University of Kalat", city: "Kalat" },
  { name: "University of Noshki", city: "Noshki" },
  { name: "University of Chaman", city: "Chaman" },
  { name: "University of Pishin", city: "Pishin" },
  { name: "University of Qilla Abdullah", city: "Qilla Abdullah" },
  { name: "University of Qilla Saifullah", city: "Qilla Saifullah" },
  { name: "University of Musakhel", city: "Musakhel" },
  { name: "University of Barkhan", city: "Barkhan" },
  { name: "University of Kohlu", city: "Kohlu" },
  { name: "University of Dera Bugti", city: "Dera Bugti" },
  { name: "University of Harnai", city: "Harnai" },
  { name: "University of Sherani", city: "Sherani" },
  { name: "University of Ziarat", city: "Ziarat" },
  { name: "University of Lasbela", city: "Lasbela" },
  { name: "University of Awaran", city: "Awaran" },
  { name: "University of Panjgur", city: "Panjgur" },
  { name: "University of Kech", city: "Kech" },
  { name: "University of Washuk", city: "Washuk" },
  { name: "University of Chagai", city: "Chagai" },
  { name: "University of Kharan", city: "Kharan" },
  { name: "University of Naseerabad", city: "Naseerabad" },
  { name: "University of Jaffarabad", city: "Jaffarabad" },
  { name: "University of Sohbatpur", city: "Sohbatpur" },
  { name: "University of Usta Muhammad", city: "Usta Muhammad" },
  { name: "University of Dera Murad Jamali", city: "Dera Murad Jamali" },
  { name: "University of Gandava", city: "Gandava" },
  { name: "University of Jhal Magsi", city: "Jhal Magsi" },
  { name: "University of Kachhi", city: "Kachhi" },
  { name: "University of Bolan", city: "Bolan" },
  { name: "University of Khuzdar South", city: "Khuzdar" },
  { name: "University of Hub", city: "Hub" },
  { name: "University of Ormara", city: "Ormara" },
  { name: "University of Pasni", city: "Pasni" },
  { name: "University of Jiwani", city: "Jiwani" },
  { name: "University of Mirpur Azad Kashmir", city: "Mirpur" },
  { name: "University of Muzaffarabad", city: "Muzaffarabad" },
  { name: "University of Kotli", city: "Kotli" },
  { name: "University of Rawalakot", city: "Rawalakot" },
  { name: "University of Bagh", city: "Bagh" },
  { name: "University of Bhimber", city: "Bhimber" },
  { name: "University of Hattian Bala", city: "Hattian Bala" },
  { name: "University of Neelum", city: "Neelum" },
  { name: "University of Sudhanoti", city: "Sudhanoti" },
  { name: "University of Haveli", city: "Haveli" },
  { name: "University of Poonch", city: "Poonch" },
  { name: "University of Islamabad Capital", city: "Islamabad" },
];

const COURSES = [
  "Computer Science",
  "Software Engineering",
  "Artificial Intelligence",
  "Data Science",
  "Cyber Security",
  "Information Technology",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Business Administration",
  "Accounting & Finance",
  "Economics",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Biotechnology",
  "Environmental Sciences",
  "Statistics",
  "English Literature",
  "Urdu Literature",
  "Islamic Studies",
  "Education",
  "Psychology",
  "Sociology",
  "Political Science",
  "International Relations",
  "Law",
  "Architecture",
  "Pharmacy",
  "Medicine",
  "Nursing",
  "Public Health",
  "Agriculture",
  "Food Science",
  "Media Studies",
  "Mass Communication",
  "Fine Arts",
  "Fashion Design",
  "Tourism & Hospitality",
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  const existing = await prisma.university.count();
  if (existing > 0) {
    console.log("Database already seeded, skipping.");
    return;
  }

  const password = await bcrypt.hash("Demo@12345", 10);
  const adminPassword = await bcrypt.hash("Admin@12345", 10);

  await prisma.user.upsert({
    where: { email: "demo@guesspaper.pk" },
    update: {},
    create: {
      email: "demo@guesspaper.pk",
      passwordHash: password,
      fullName: "Demo Student",
      fatherName: "Demo Father",
      cnic: "35201-1234567-1",
      profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
      role: "STUDENT",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@guesspaper.pk" },
    update: {},
    create: {
      email: "admin@guesspaper.pk",
      passwordHash: adminPassword,
      fullName: "Admin User",
      fatherName: "System Admin",
      cnic: "35201-7654321-9",
      profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      role: "ADMIN",
    },
  });

  for (const uni of UNIVERSITIES) {
    const university = await prisma.university.create({
      data: {
        name: uni.name,
        slug: slugify(uni.name),
        city: uni.city,
      },
    });

    await prisma.course.createMany({
      data: COURSES.map((courseName) => ({
        name: courseName,
        slug: slugify(courseName),
        universityId: university.id,
      })),
    });
  }

  await prisma.aiPromptTemplate.upsert({
    where: { name: "default" },
    update: {},
    create: {
      name: "default",
      template: `You are an expert academic advisor for Pakistani universities. Generate realistic exam-style guess papers based on typical curriculum, exam patterns, and frequently asked topics. Return valid JSON only with this structure:
{
  "sectionA": { "title": "Section A - MCQs", "mcqs": [{ "question": "", "options": ["A","B","C","D"], "answer": "A" }] },
  "sectionB": { "title": "Section B - Short Questions", "questions": ["..."] },
  "sectionC": { "title": "Section C - Long Questions", "questions": ["..."] },
  "sectionD": { "title": "Section D - Important Topics", "topics": [{ "topic": "", "probability": "high|medium", "notes": "" }] },
  "sectionE": { "title": "Section E - Study Tips", "tips": ["..."] }
}
Include exactly 30 MCQs, 20 short questions, 10 long questions.`,
      isActive: true,
    },
  });

  console.log("Seed completed:", UNIVERSITIES.length, "universities,", COURSES.length, "courses each");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
