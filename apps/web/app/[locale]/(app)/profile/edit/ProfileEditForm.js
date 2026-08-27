"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useI18n } from "@/locales/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { CountrySelect } from "@/components/CountrySelect";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { updateProfileAction } from "@/lib/actions/profileActions";
import { deleteAccountAction } from "@/lib/actions/authActions";
import { mockSignOutAction } from "@/lib/actions/mockAuthActions";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { uploadAvatar } from "@/lib/supabaseStorage";

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
const NO_GATE_TEST = "none";

export function ProfileEditForm({ locale, profile, tests }) {
  const t = useI18n();
  const router = useRouter();

  const [name, setName] = useState(profile.name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [gender, setGender] = useState(profile.gender ?? "male");
  const [birthdate, setBirthdate] = useState(profile.birthdate ?? "");
  const [interestedIn, setInterestedIn] = useState(profile.interestedIn ?? "both");
  const [country, setCountry] = useState(profile.country ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [gateTestId, setGateTestId] = useState(profile.gateTestId ?? NO_GATE_TEST);
  const [gateTestThreshold, setGateTestThreshold] = useState(profile.gateTestThreshold ?? 50);
  const [allowGuestLikes, setAllowGuestLikes] = useState(profile.allowGuestLikes ?? false);
  const [instagram, setInstagram] = useState(profile.socialLinks?.instagram ?? "");
  const [twitter, setTwitter] = useState(profile.socialLinks?.twitter ?? "");
  const [tiktok, setTiktok] = useState(profile.socialLinks?.tiktok ?? "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function handleAvatarChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (USE_MOCK_DATA) {
      const reader = new FileReader();
      reader.onload = () => setAvatarUrl(reader.result);
      reader.readAsDataURL(file);
      return;
    }

    setAvatarUploading(true);
    try {
      const url = await uploadAvatar(file, profile.id);
      setAvatarUrl(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const socialLinks = {};
    if (instagram) socialLinks.instagram = instagram;
    if (twitter) socialLinks.twitter = twitter;
    if (tiktok) socialLinks.tiktok = tiktok;

    const result = await updateProfileAction({
      name,
      bio,
      gender,
      birthdate,
      interestedIn,
      country,
      avatarUrl,
      gateTestId: gateTestId === NO_GATE_TEST ? null : gateTestId,
      gateTestThreshold: gateTestId === NO_GATE_TEST ? null : Number(gateTestThreshold),
      allowGuestLikes,
      socialLinks,
    });

    if (result.status === "error") {
      setError(result.message);
      setLoading(false);
      return;
    }

    router.push(`/${locale}/profile`);
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    await deleteAccountAction();
    if (USE_MOCK_DATA) {
      await mockSignOutAction();
    } else {
      await getSupabaseBrowserClient().auth.signOut();
    }
    router.push(`/${locale}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 overflow-hidden rounded-full bg-muted">
          {avatarUrl && <Image src={avatarUrl} alt="" fill unoptimized={avatarUrl.startsWith("data:")} className="object-cover" />}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="avatar" className="text-sm text-muted-foreground">
            {t("profile.avatarLabel")}
          </label>
          <input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} />
          {avatarUploading && <p className="text-xs text-muted-foreground">{t("profile.avatarUploading")}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm text-muted-foreground">
          {t("auth.nameLabel")}
        </label>
        <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="bio" className="text-sm text-muted-foreground">
          {t("profile.bioLabel")}
        </label>
        <Textarea id="bio" rows={3} maxLength={1000} value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">{t("auth.onboarding.genderLabel")}</label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">{t("auth.onboarding.genderMale")}</SelectItem>
              <SelectItem value="female">{t("auth.onboarding.genderFemale")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">{t("auth.onboarding.interestedInLabel")}</label>
          <Select value={interestedIn} onValueChange={setInterestedIn}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">{t("auth.onboarding.interestedMale")}</SelectItem>
              <SelectItem value="female">{t("auth.onboarding.interestedFemale")}</SelectItem>
              <SelectItem value="both">{t("auth.onboarding.interestedBoth")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="birthdate" className="text-sm text-muted-foreground">
            {t("auth.onboarding.birthdateLabel")}
          </label>
          <Input id="birthdate" type="date" required value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">{t("profile.countryLabel")}</label>
          <CountrySelect value={country} onValueChange={setCountry} placeholder={t("profile.countryPlaceholder")} />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-muted-foreground">{t("profile.gateTestLabel")}</label>
        <Select value={gateTestId} onValueChange={setGateTestId}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_GATE_TEST}>{t("profile.gateTestNone")}</SelectItem>
            {tests.map((test) => (
              <SelectItem key={test.id} value={test.id}>
                {test.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {gateTestId !== NO_GATE_TEST && (
        <div className="flex flex-col gap-1">
          <label htmlFor="gateTestThreshold" className="text-sm text-muted-foreground">
            {t("profile.gateTestThresholdLabel")}
          </label>
          <Input
            id="gateTestThreshold"
            type="number"
            min={0}
            max={100}
            value={gateTestThreshold}
            onChange={(e) => setGateTestThreshold(e.target.value)}
          />
        </div>
      )}

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={allowGuestLikes}
          onChange={(e) => setAllowGuestLikes(e.target.checked)}
        />
        {t("profile.allowGuestLikesLabel")}
      </label>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm text-muted-foreground">{t("profile.socialLinksLabel")}</legend>
        <Input placeholder="Instagram URL" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
        <Input placeholder="Twitter/X URL" value={twitter} onChange={(e) => setTwitter(e.target.value)} />
        <Input placeholder="TikTok URL" value={tiktok} onChange={(e) => setTiktok(e.target.value)} />
      </fieldset>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" variant="confirm" loading={loading}>
        {t("profile.save")}
      </Button>

      <Dialog>
        <DialogTrigger asChild>
          <Button type="button" variant="delete">
            {t("profile.deleteAccount")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>{t("profile.deleteAccountConfirmTitle")}</DialogTitle>
          <DialogDescription>{t("profile.deleteAccountConfirmBody")}</DialogDescription>
          <div className="mt-4 flex justify-end gap-3">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("profile.cancel")}
              </Button>
            </DialogClose>
            <Button type="button" variant="delete" loading={deleting} onClick={handleDeleteAccount}>
              {t("profile.deleteAccountConfirmAction")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
}
