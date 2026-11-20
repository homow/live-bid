"use client";

import { useState } from "react";

import ProfileOverview from "./components/ProfileOverview";
import ProfileForm from "./components/ProfileForm";
import ProfileTabs from "./components/ProfileTabs";

import {
  PageTitle,
  P,
  SectionTitle,
  Label,
} from "@/Components/Ui/typography/typography";

import { Input } from "@/Components/Ui/input";
import { Button } from "@/Components/Ui/button/button";

export type ProfileTabType = "information" | "password" | "update";

export default function Profile() {
  const [activeTab, setActiveTab] = useState<ProfileTabType>("information");

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6">
      <div className="space-y-2">
        <PageTitle>Profile</PageTitle>
        <P>Manage your profile information and account settings.</P>
      </div>

      <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "information" && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">
          <ProfileOverview />
          <ProfileForm showAccountInfo />
        </div>
      )}

      {activeTab === "update" && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">
          <div className="hidden lg:block">
            <ProfileOverview />
          </div>

          <ProfileForm />
        </div>
      )}

      {activeTab === "password" && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">
          <div className="hidden lg:block">
            <ProfileOverview />
          </div>

          <section className="min-w-0 rounded-xl border border-border bg-card p-5 sm:p-7">
            <div className="mb-6 space-y-2">
              <SectionTitle>Change Password</SectionTitle>
              <P>Update your password to keep your account secure.</P>
            </div>

            <form className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label>Current Password</Label>

                  <Input type="password" placeholder="Enter current password" />
                </div>

                <div>
                  <Label>New Password</Label>

                  <Input type="password" placeholder="Enter new password" />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="button" size="lg" className="w-full sm:w-auto">
                  Update Password
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
