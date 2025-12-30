"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Upload, Check } from "lucide-react"
import Chat from "@/components/features/chat"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function ThemePage() {
  const params = useParams()
  const chatbotId = params.id as string

  // Theme Settings
  const [theme, setTheme] = useState("light")

  // Avatar Settings
  const [avatar, setAvatar] = useState<string | null>(null)
  const [avatarSize, setAvatarSize] = useState(50)
  const [avatarColor, setAvatarColor] = useState("blue")
  const [avatarBorder, setAvatarBorder] = useState("flat")
  const [avatarBgColor, setAvatarBgColor] = useState("blue")

  // Icon Settings
  const [icon, setIcon] = useState<string | null>(null)
  const [iconSize, setIconSize] = useState(50)
  const [iconColor, setIconColor] = useState("white")
  const [iconShape, setIconShape] = useState("round")
  const [iconBorder, setIconBorder] = useState("flat")
  const [iconBgColor, setIconBgColor] = useState("blue")

  // Behavior Settings
  const [popupOnload, setPopupOnload] = useState(false)

  const colors = [
    { name: "blue", label: "Blue", value: "#3b82f6" },
    { name: "black", label: "Black", value: "#000000" },
    { name: "purple", label: "Purple", value: "#a855f7" },
    { name: "green", label: "Green", value: "#16a34a" },
    { name: "red", label: "Red", value: "#dc2626" },
    { name: "orange", label: "Orange", value: "#ea580c" },
  ]

  const getColorValue = (colorName: string) => {
    const colorObj = colors.find((c) => c.name === colorName)
    return colorObj ? colorObj.value : "#3b82f6"
  }

  const getShapeClass = (shape: string) => {
    switch (shape) {
      case "round":
        return "rounded-full"
      case "square":
        return "rounded-none"
      case "rounded":
        return "rounded-lg"
      default:
        return "rounded-full"
    }
  }

  useEffect(() => {
    if (chatbotId) {
      fetch(`/api/chatbots/${chatbotId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch chatbot")
          return res.json()
        })
        .then((data) => {
          if (data.avatar) setAvatar(data.avatar)
          if (data.avatarSize) setAvatarSize(data.avatarSize)
          if (data.avatarColor) setAvatarColor(data.avatarColor)
          if (data.avatarBorder) setAvatarBorder(data.avatarBorder)
          if (data.avatarBgColor) setAvatarBgColor(data.avatarBgColor)

          if (data.icon) setIcon(data.icon)
          if (data.iconSize) setIconSize(data.iconSize)
          if (data.iconColor) setIconColor(data.iconColor)
          if (data.iconShape) setIconShape(data.iconShape)
          if (data.iconBorder) setIconBorder(data.iconBorder)
          if (data.iconBgColor) setIconBgColor(data.iconBgColor)

          if (data.theme) setTheme(data.theme)
          if (data.popup_onload !== undefined) setPopupOnload(data.popup_onload)
        })
        .catch((error) => {
          console.error("Error fetching chatbot:", error)
        })
    }
  }, [chatbotId])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setter(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/chatbots/${chatbotId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme,
          avatar,
          avatarSize,
          avatarColor,
          avatarBorder,
          avatarBgColor,
          icon,
          iconSize,
          iconColor,
          iconShape,
          iconBorder,
          iconBgColor,
          popup_onload: popupOnload,
        }),
      })

      if (response.ok) {
        toast.success("Changes saved successfully!")
      } else {
        toast.error("Failed to save changes")
      }
    } catch (error) {
      console.error("Error saving changes:", error)
      toast.error("Error saving changes")
    }
  }

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-0 h-screen">
        {/* Left Panel - Settings */}
        <div className="overflow-y-auto border-r border-border bg-card">
          <div className="p-6 space-y-8">
            {/* Theme Selection */}
            <SettingsSection title="Theme">
              <div className="space-y-3">
                <Label htmlFor="theme" className="font-medium">
                  Color Theme
                </Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </SettingsSection>

            {/* Icon Settings */}
            <SettingsSection title="Icon">
              <div className="space-y-4">
                {/* Upload & Shape */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-medium mb-2">Upload Icon</Label>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-muted-foreground bg-transparent"
                      onClick={() => document.getElementById("icon-upload")?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                    <input
                      id="icon-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, setIcon)}
                    />
                    {icon && <div className="mt-2 text-xs text-green-600 font-medium">✓ Selected</div>}
                  </div>

                  <div>
                    <Label htmlFor="icon-shape" className="font-medium">
                      Shape
                    </Label>
                    <Select value={iconShape} onValueChange={setIconShape}>
                      <SelectTrigger id="icon-shape" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="round">Round</SelectItem>
                        <SelectItem value="square">Square</SelectItem>
                        <SelectItem value="rounded">Rounded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Icon Size */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="font-medium">Size</Label>
                    <span className="text-sm font-semibold text-primary">{iconSize}px</span>
                  </div>
                  <Slider value={[iconSize]} onValueChange={(val) => setIconSize(val[0])} min={20} max={100} step={5} />
                </div>

                {/* Icon Colors */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium block mb-2">Icon Color</Label>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <button
                          key={`icon-color-${color.name}`}
                          onClick={() => setIconColor(color.name)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            iconColor === color.name ? "border-foreground ring-2 ring-offset-1" : "border-border"
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="font-medium block mb-2">Background</Label>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <button
                          key={`icon-bg-${color.name}`}
                          onClick={() => setIconBgColor(color.name)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            iconBgColor === color.name ? "border-foreground ring-2 ring-offset-1" : "border-border"
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Icon Border */}
                <div>
                  <Label htmlFor="icon-border" className="font-medium">
                    Border Style
                  </Label>
                  <Select value={iconBorder} onValueChange={setIconBorder}>
                    <SelectTrigger id="icon-border" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flat">Flat</SelectItem>
                      <SelectItem value="outline">Outline</SelectItem>
                      <SelectItem value="shadow">Shadow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Icon Preview */}
                <div className="border border-border rounded-lg p-4 bg-muted">
                  <div className="text-xs font-medium text-muted-foreground mb-3">Preview</div>
                  <div className="flex justify-center py-6 bg-background rounded">
                    <div
                      className={`${getShapeClass(iconShape)} flex items-center justify-center overflow-hidden`}
                      style={{
                        width: `${iconSize}px`,
                        height: `${iconSize}px`,
                        backgroundColor: getColorValue(iconBgColor),
                        border: iconBorder === "outline" ? `2px solid ${getColorValue(iconColor)}` : "none",
                        boxShadow: iconBorder === "shadow" ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                      }}
                    >
                      {icon ? (
                        <img
                          src={icon || "/placeholder.svg"}
                          alt="Icon preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-1/2 h-1/2" fill={getColorValue(iconColor)} viewBox="0 0 24 24">
                          <path d="M20 2H4c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12h-4v4h-4v-4H4V4h16v10z" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </SettingsSection>

            {/* Avatar Settings */}
            <SettingsSection title="Avatar">
              <div className="space-y-4">
                {/* Upload & Border */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-medium mb-2">Upload Avatar</Label>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-muted-foreground bg-transparent"
                      onClick={() => document.getElementById("avatar-upload")?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                    <input
                      id="avatar-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, setAvatar)}
                    />
                    {avatar && <div className="mt-2 text-xs text-green-600 font-medium">✓ Selected</div>}
                  </div>

                  <div>
                    <Label htmlFor="avatar-border" className="font-medium">
                      Border Style
                    </Label>
                    <Select value={avatarBorder} onValueChange={setAvatarBorder}>
                      <SelectTrigger id="avatar-border" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flat">Flat</SelectItem>
                        <SelectItem value="outline">Outline</SelectItem>
                        <SelectItem value="shadow">Shadow</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Avatar Size */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="font-medium">Size</Label>
                    <span className="text-sm font-semibold text-primary">{avatarSize}px</span>
                  </div>
                  <Slider
                    value={[avatarSize]}
                    onValueChange={(val) => setAvatarSize(val[0])}
                    min={20}
                    max={120}
                    step={5}
                  />
                </div>

                {/* Avatar Colors */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium block mb-2">Avatar Color</Label>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <button
                          key={`avatar-color-${color.name}`}
                          onClick={() => setAvatarColor(color.name)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            avatarColor === color.name ? "border-foreground ring-2 ring-offset-1" : "border-border"
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="font-medium block mb-2">Background</Label>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <button
                          key={`avatar-bg-${color.name}`}
                          onClick={() => setAvatarBgColor(color.name)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            avatarBgColor === color.name ? "border-foreground ring-2 ring-offset-1" : "border-border"
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Avatar Preview */}
                <div className="border border-border rounded-lg p-4 bg-muted">
                  <div className="text-xs font-medium text-muted-foreground mb-3">Preview</div>
                  <div className="flex justify-center py-6 bg-background rounded">
                    <div
                      className={`rounded-full flex items-center justify-center overflow-hidden`}
                      style={{
                        width: `${avatarSize}px`,
                        height: `${avatarSize}px`,
                        backgroundColor: getColorValue(avatarBgColor),
                        border: avatarBorder === "outline" ? `2px solid ${getColorValue(avatarColor)}` : "none",
                        boxShadow: avatarBorder === "shadow" ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                      }}
                    >
                      {avatar ? (
                        <img
                          src={avatar || "/placeholder.svg"}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-1/2 h-1/2 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </SettingsSection>

            {/* Behavior Settings */}
            <SettingsSection title="Behavior">
              <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg hover:bg-muted/50 transition">
                <Checkbox
                  checked={popupOnload}
                  onCheckedChange={(checked) => setPopupOnload(checked as boolean)}
                  className="mt-1"
                />
                <span className="text-sm leading-relaxed">
                  <div className="font-medium">Auto-open on page load</div>
                  <div className="text-xs text-muted-foreground">Opens chatbot popup automatically (desktop only)</div>
                </span>
              </label>
            </SettingsSection>

            {/* Save Button */}
            <Button
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mb-6 font-semibold"
              onClick={handleSave}
            >
              <Check className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Right Panel - Preview (unchanged) */}
        <div className="hidden lg:flex flex-col bg-linear-to-br from-blue-50 via-purple-50 to-white">
          <Chat
            id={chatbotId}
            avatar={avatar}
            icon={icon}
            iconShape={iconShape}
            iconSize={iconSize}
            iconColor={iconColor}
            iconBgColor={iconBgColor}
            iconBorder={iconBorder}
            avatarSize={avatarSize}
            avatarColor={avatarColor}
            avatarBgColor={avatarBgColor}
            avatarBorder={avatarBorder}
            theme={theme}
            showPreviewControls={true}
          />
        </div>
      </div>
    </div>
  )
}

interface SettingsSectionProps {
  title: string
  icon?: string
  children: React.ReactNode
}

function SettingsSection({ title, icon, children }: SettingsSectionProps) {
  return (
    <div className="space-y-3 pb-4 border-b border-border">
      <div className="flex items-center space-x-2">
        {icon && <span className="text-lg">{icon}</span>}
        <h3 className="font-bold text-foreground text-base">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}