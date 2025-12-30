"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2 } from "lucide-react"

// Form validation schema - only name matters
const formSchema = z.object({
  name: z
    .string()
    .min(1, "Chatbot name is required")
    .max(50, "Name must be less than 50 characters")
    .trim(),
})

type FormValues = z.infer<typeof formSchema>

export default function ChatbotForm() {
  const router = useRouter()

  // Initialize form with React Hook Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
    mode: "onChange",
  })

  const {
    handleSubmit,
    watch,
    formState: { isSubmitting, isValid },
  } = form

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await fetch('/api/chatbots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          workspaceId: "cmjjl2lc50002jktx7kj0h1n4", // This should come from context/params
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create chatbot')
      }

      // Redirect to the newly created chatbot's edit page
      router.push(`/chatbots/${responseData.chatbot.id}/instructions`)

    } catch (error) {
      console.error('Error creating chatbot:', error)
      // You could add a toast notification here
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Create New Chatbot</h1>
          <p className="text-muted-foreground mt-2">
            Give your chatbot a name to get started
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Name Input (Only Required Field) */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base font-medium">
                    Chatbot Name
                    <span className="text-destructive ml-1">*</span>
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Give your chatbot a descriptive name. You can change this later.
                  </p>
                  <FormControl>
                    <Input
                      placeholder="e.g., Customer Support Bot, Sales Assistant, FAQ Helper"
                      className="h-11 text-lg"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between items-center">
                    <FormMessage />
                    <span className={`text-xs ${
                      field.value.length > 50 ? 'text-destructive' : 'text-muted-foreground'
                    }`}>
                      {field.value.length}/50
                    </span>
                  </div>
                </FormItem>
              )}
            />

            {/* Status Indicator */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  watch("name")?.trim().length > 0 ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <span className={
                  watch("name")?.trim().length > 0 ? 'text-green-600' : 'text-muted-foreground'
                }>
                  {watch("name")?.trim().length > 0 
                    ? `Ready to create "${watch("name").trim()}"` 
                    : 'Enter a chatbot name above'
                  }
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-11 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isSubmitting || !isValid}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Chatbot'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}