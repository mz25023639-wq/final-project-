"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import Image from "next/image";

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    fullName: "",
    fatherName: "",
    cnic: "",
    email: "",
    profileImage: "",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/users/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.id) {
          setProfile({
            fullName: data.fullName,
            fatherName: data.fatherName,
            cnic: data.cnic,
            email: data.email,
            profileImage: data.profileImage || "",
          });
        }
      });
  }, []);

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const res = await fetch("/api/users/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });

    if (res.ok) setMessage("Profile updated successfully");
    else {
      const data = await res.json();
      setError(data.error || "Update failed");
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const res = await fetch("/api/users/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(passwords),
    });

    if (res.ok) {
      setMessage("Password updated successfully");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      const data = await res.json();
      setError(data.error || "Password update failed");
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-8">
        <h1 className="text-3xl font-bold">Settings</h1>

        {message && <p className="text-sm text-emerald-400">{message}</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}

        <Card>
          <CardTitle className="mb-6">Profile</CardTitle>
          <form onSubmit={updateProfile} className="space-y-4">
            <div className="flex items-center gap-4">
              <Image
                src={profile.profileImage || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"}
                alt="Profile"
                width={64}
                height={64}
                className="rounded-full"
                unoptimized
              />
              <div className="flex-1">
                <Label htmlFor="profileImage">Profile Image URL</Label>
                <Input
                  id="profileImage"
                  value={profile.profileImage}
                  onChange={(e) => setProfile({ ...profile, profileImage: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="fatherName">Father Name</Label>
              <Input id="fatherName" value={profile.fatherName} onChange={(e) => setProfile({ ...profile, fatherName: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="cnic">CNIC</Label>
              <Input id="cnic" value={profile.cnic} onChange={(e) => setProfile({ ...profile, cnic: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
            </div>
            <Button type="submit">Save Profile</Button>
          </form>
        </Card>

        <Card>
          <CardTitle className="mb-6">Change Password</CardTitle>
          <form onSubmit={updatePassword} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} />
            </div>
            <Button type="submit">Update Password</Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
