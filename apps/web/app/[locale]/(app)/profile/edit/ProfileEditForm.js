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
import { TestPicker } from "@/components/TestPicker";
import { InfoBanner } from "@/components/InfoBanner";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { updateProfileAction, uploadAvatarAction } from "@/lib/actions/profileActions";
import { deleteAccountAction } from "@/lib/actions/authActions";
import { mockSignOutAction } from "@/lib/actions/mockAuthActions";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
const NO_GATE_TEST = "none";
const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function ProfileEditForm({ locale, profile, initialGateTest }) {
  const t = useI18n();
  const router = useRouter();

  const [name, setName] = useState(profile.name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [gender, setGender] = useState(profile.gender ?? "male");
  const [birthdate, setBirthdate] = useState(profile.birthdate ?? "");
  const [interestedIn, setInterestedIn] = useState(profile.interestedIn ?? "both");
  const [country, setCountry] = useState(profile.country ?? "");
  const [photos, setPhotos] = useState(() => {
    const initial = profile.photos?.length ? profile.photos : profile.avatarUrl ? [profile.avatarUrl] : [];
    return [initial[0] ?? null, initial[1] ?? null, initial[2] ?? null];
  });
  const [photoUploading, setPhotoUploading] = useState([false, false, false]);
  const [gateTestId, setGateTestId] = useState(profile.gateTestId ?? NO_GATE_TEST);
  const [gateTestThreshold, setGateTestThreshold] = useState(profile.gateTestThreshold ?? 50);
  const [allowGuestLikes, setAllowGuestLikes] = useState(profile.allowGuestLikes ?? false);
  const [instagram, setInstagram] = useState(profile.socialLinks?.instagram ?? "");
  const [twitter, setTwitter] = useState(profile.socialLinks?.twitter ?? "");
  const [tiktok, setTiktok] = useState(profile.socialLinks?.tiktok ?? "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Üç foto slotunun her biri, mevcut tekli avatar yüklemesiyle birebir
  // aynı `uploadAvatarAction`/storage akışını bağımsız olarak çağırır —
  // storage repository'si zaten `${userId}/${timestamp}.${ext}` yoluyla
  // çoklu dosyayı destekliyor, sadece hangi slotun state'i güncelleneceği
  // değişiyor.
  async function handlePhotoChange(index, event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (USE_MOCK_DATA) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotos((prev) => {
          const next = [...prev];
          next[index] = reader.result;
          return next;
        });
      };
      reader.readAsDataURL(file);
      return;
    }

    // Sunucu (uploadAvatar usecase'i) aynı kontrolleri zaten yapıyor —
    // burada tekrarlanması sadece geçersiz bir dosya için gereksiz bir
    // yükleme turunu (ve büyük dosyalarda gözle görülür bir bekleyişi)
    // önlemek için.
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setError(t("profile.avatarInvalidType"));
      event.target.value = "";
      return;
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setError(t("profile.avatarTooLarge"));
      event.target.value = "";
      return;
    }

    setError(null);
    setPhotoUploading((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
    try {
      const formData = new FormData();
      formData.set("avatar", file);
      const result = await uploadAvatarAction(formData);
      if (result.status === "error") {
        setError(
          result.message === "file_too_large" ? t("profile.avatarTooLarge") : t("profile.avatarInvalidType")
        );
        return;
      }
      setPhotos((prev) => {
        const next = [...prev];
        next[index] = result.data.avatarUrl;
        return next;
      });
    } catch {
      setError(t("profile.avatarUploadFailed"));
    } finally {
      setPhotoUploading((prev) => {
        const next = [...prev];
        next[index] = false;
        return next;
      });
    }
  }

  function handleRemovePhoto(index) {
    setPhotos((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const socialLinks = {};
    if (instagram) socialLinks.instagram = instagram;
    if (twitter) socialLinks.twitter = twitter;
    if (tiktok) socialLinks.tiktok = tiktok;

    const densePhotos = photos.filter(Boolean);
    const result = await updateProfileAction({
      name,
      bio,
      gender,
      birthdate,
      interestedIn,
      country,
      avatarUrl: densePhotos[0] ?? null,
      photos: densePhotos,
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
      <div className="flex flex-col gap-2">
        <label className="text-sm text-muted-foreground">{t("profile.photosLabel")}</label>
        <div className="flex gap-3">
          {photos.map((photo, index) => (
            <div key={index} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
              {photo ? (
                <>
                  <Image src={photo} alt="" fill unoptimized={photo.startsWith("data:")} className="object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    aria-label={t("profile.removePhoto")}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-xs font-bold text-foreground"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <label
                  htmlFor={`photo-${index}`}
                  className="flex h-full w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border text-2xl text-muted-foreground"
                >
                  +
                  <input
                    id={`photo-${index}`}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => handlePhotoChange(index, e)}
                  />
                </label>
              )}
              {photoUploading[index] && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 text-xs text-muted-foreground">
                  {t("profile.avatarUploading")}
                </div>
              )}
            </div>
          ))}
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

      <div className="flex flex-col gap-2">
        <label className="text-sm text-muted-foreground">{t("profile.gateTestLabel")}</label>
        <InfoBanner>{t("discover.gateTestExplainer")}</InfoBanner>
        <TestPicker
          value={gateTestId}
          onValueChange={setGateTestId}
          initialSelectedTest={initialGateTest}
          noneLabel={t("profile.gateTestNone")}
          placeholder={t("profile.gateTestLabel")}
        />
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
