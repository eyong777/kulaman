"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Check, Copy } from "lucide-react";
import { createUser, upsertCategory, upsertSchool } from "@/actions/admin";
import { updateOwnSettings } from "@/actions/auth";
import { updateSchoolProfile } from "@/actions/reports";
import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/types/actions";
import type { ReportCategory, School, UserProfile } from "@/types/database";

function FormMessage({ state }: { state: { error?: string; success?: string } | null }) {
  if (!state) return null;
  if (state.error) return <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{state.error}</div>;
  if (state.success)
    return <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{state.success}</div>;
  return null;
}

function CreatedUserMessage({ state }: { state: ActionState }) {
  const [copied, setCopied] = useState<string | null>(null);
  if (!state?.success) return <FormMessage state={state} />;

  const loginId = state.success.match(/Login ID: ([^.]+(?:\.[^.]+)*@[^.]+(?:\.[^.]+)+)\./)?.[1] ?? "";
  const temporaryPassword = state.success.match(/Temporary password: (.+)$/)?.[1] ?? "";

  async function copy(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 1800);
  }

  return (
    <div className="space-y-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 md:col-span-2">
      <p className="font-semibold">Account created. Give this login ID and temporary password to the user.</p>
      {loginId ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="min-w-28 font-medium">Login ID</span>
          <code className="flex-1 rounded bg-white px-2 py-1 text-slate-900">{loginId}</code>
          <Button type="button" size="sm" variant="outline" onClick={() => copy(loginId, "login")}>
            {copied === "login" ? <Check className="size-4" /> : <Copy className="size-4" />}
            Copy
          </Button>
        </div>
      ) : null}
      {temporaryPassword ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="min-w-28 font-medium">Password</span>
          <code className="flex-1 rounded bg-white px-2 py-1 text-slate-900">{temporaryPassword}</code>
          <Button type="button" size="sm" variant="outline" onClick={() => copy(temporaryPassword, "password")}>
            {copied === "password" ? <Check className="size-4" /> : <Copy className="size-4" />}
            Copy
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function SchoolForm({ school }: { school?: School }) {
  const [state, action] = useActionState<ActionState, FormData>(upsertSchool, null);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{school ? "Edit school" : "Add school"}</CardTitle>
        <CardDescription>Maintain official school records and contact information.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="id" value={school?.id ?? ""} />
          <FormMessage state={state} />
          <Field name="school_id" label="School ID" defaultValue={school?.school_id} required />
          <Field name="name" label="School Name" defaultValue={school?.name} required />
          <Field name="district" label="District" defaultValue={school?.district ?? ""} />
          <Field name="head_name" label="School Head" defaultValue={school?.head_name ?? ""} />
          <Field name="contact_email" label="Contact Email" type="email" defaultValue={school?.contact_email ?? ""} />
          <Field name="contact_phone" label="Contact Phone" defaultValue={school?.contact_phone ?? ""} />
          <Field name="enrollment_count" label="Enrollment Count" type="number" defaultValue={school?.enrollment_count ?? ""} />
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" name="address" defaultValue={school?.address ?? ""} />
          </div>
          <div className="md:col-span-2">
            <SubmitButton>Save school</SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function CategoryForm({ category }: { category?: ReportCategory }) {
  const [state, action] = useActionState<ActionState, FormData>(upsertCategory, null);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{category ? "Edit category" : "Add category"}</CardTitle>
        <CardDescription>Categories organize reports and power dashboard analytics.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <input type="hidden" name="id" value={category?.id ?? ""} />
          <FormMessage state={state} />
          <Field name="name" label="Category Name" defaultValue={category?.name} required />
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={category?.description ?? ""} />
          </div>
          <input type="hidden" name="is_active" value="false" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_active" defaultChecked={category?.is_active ?? true} value="true" />
            Active category
          </label>
          <SubmitButton>Save category</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}

export function UserForm({ schools }: { schools: School[] }) {
  const [state, action] = useActionState<ActionState, FormData>(createUser, null);
  const [role, setRole] = useState("school_user");
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create user</CardTitle>
        <CardDescription>Create Admin, School Head, and School Coordinator accounts without sending email invitations.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4 md:grid-cols-2">
          <CreatedUserMessage state={state} />
          <Field name="full_name" label="Full Name" required />
          <Field name="email" label="Login ID or Email" required />
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select id="role" name="role" value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="school_user">School Coordinator</option>
              <option value="school_head">School Head</option>
              <option value="admin">Admin</option>
            </Select>
          </div>
          {role === "school_user" ? (
            <div className="space-y-2">
              <Label htmlFor="school_id">Assigned School</Label>
              <Select id="school_id" name="school_id" defaultValue="" required>
                <option value="">Select school</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </Select>
            </div>
          ) : (
            <input type="hidden" name="school_id" value="" />
          )}
          <input type="hidden" name="is_active" value="false" />
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" name="is_active" defaultChecked value="true" />
            Active account
          </label>
          <div className="md:col-span-2">
            <SubmitButton>Create account</SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function SchoolProfileForm({ school }: { school: School }) {
  const [state, action] = useActionState<ActionState, FormData>(updateSchoolProfile, null);
  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <FormMessage state={state} />
      <Field name="school_id" label="School ID" defaultValue={school.school_id} required />
      <Field name="name" label="School Name" defaultValue={school.name} required />
      <Field name="district" label="District" defaultValue={school.district ?? ""} />
      <Field name="head_name" label="School Head" defaultValue={school.head_name ?? ""} />
      <Field name="contact_email" label="Contact Email" type="email" defaultValue={school.contact_email ?? ""} />
      <Field name="contact_phone" label="Contact Phone" defaultValue={school.contact_phone ?? ""} />
      <Field name="enrollment_count" label="Enrollment Count" type="number" defaultValue={school.enrollment_count ?? ""} />
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="address">Address</Label>
        <Textarea id="address" name="address" defaultValue={school.address ?? ""} />
      </div>
      <div className="md:col-span-2">
        <SubmitButton>Update profile</SubmitButton>
      </div>
    </form>
  );
}

export function SettingsForm({ profile }: { profile: UserProfile }) {
  const [state, action] = useActionState<ActionState, FormData>(updateOwnSettings, null);
  return (
    <form action={action} className="max-w-xl space-y-4">
      <FormMessage state={state} />
      <Field name="full_name" label="Full Name" defaultValue={profile.full_name} required />
      <Field name="email" label="Email" defaultValue={profile.email} disabled />
      <SubmitButton>Save settings</SubmitButton>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  defaultValue,
  required,
  disabled
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string | number | null;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} defaultValue={defaultValue ?? ""} required={required} disabled={disabled} />
    </div>
  );
}
