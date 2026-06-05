"use client";

import { useActionState } from "react";
import { createUser, upsertCategory, upsertSchool } from "@/actions/admin";
import { updateOwnSettings } from "@/actions/auth";
import { updateSchoolProfile } from "@/actions/reports";
import { SubmitButton } from "@/components/forms/submit-button";
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create user</CardTitle>
        <CardDescription>Admin can create Admin, School Head, and School User accounts.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4 md:grid-cols-2">
          <FormMessage state={state} />
          <Field name="full_name" label="Full Name" required />
          <Field name="email" label="Email" type="email" required />
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select id="role" name="role" defaultValue="school_user">
              <option value="school_user">School User</option>
              <option value="school_head">School Head</option>
              <option value="admin">Admin</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="school_id">Assigned School</Label>
            <Select id="school_id" name="school_id" defaultValue="">
              <option value="">Not assigned</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </Select>
          </div>
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
