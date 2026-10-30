import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import { createKnowledgeBase } from "@/services/knowledgeService";
import { getSystemSettings, type ModelCandidate } from "@/services/settingsService";
import { getErrorMessage } from "@/utils/error";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Please input knowledge base name")
    .max(50, "Name must be less than 50 characters"),
  embeddingModel: z.string().min(1, "Please select embedding model"),
  collectionName: z
    .string()
    .min(1, "Please input collection name")
    .max(50, "Collection name must be less than 50 characters")
    .regex(/^[a-z0-9]+$/, "Collection name must contain only lowercase letters and numbers")
});

type FormValues = z.infer<typeof formSchema>;

interface CreateKnowledgeBaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateKnowledgeBaseDialog({
  open,
  onOpenChange,
  onSuccess
}: CreateKnowledgeBaseDialogProps) {
  const [loading, setLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [embeddingModels, setEmbeddingModels] = useState<ModelCandidate[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      embeddingModel: "",
      collectionName: ""
    }
  });

  useEffect(() => {
    if (!open) return;
    let active = true;
    setModelLoading(true);
    getSystemSettings()
      .then((settings) => {
        if (!active) return;
        const candidates = settings.ai?.embedding?.candidates || [];
        const enabledModels = candidates.filter((item) => item.enabled !== false);
        setEmbeddingModels(enabledModels);
      })
      .catch(() => {
        if (active) {
          setEmbeddingModels([]);
        }
      })
      .finally(() => {
        if (active) {
          setModelLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [open, form]);

  const selectOptions = useMemo(() => {
    if (embeddingModels.length == 0) return [];
    const uniqueMap = new Map<string, ModelCandidate>();
    embeddingModels.forEach((item) => {
      if (item.id) {
        uniqueMap.set(item.id, item);
      }
    });
    return Array.from(uniqueMap.values());
  }, [embeddingModels]);

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      await createKnowledgeBase(values);
      toast.success("Create knowledge base successfully");
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(getErrorMessage(error, "Create knowledge base failed"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset({
        name: "",
        embeddingModel: "",
        collectionName: ""
      });
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-[500px]" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Create Knowledge Base</DialogTitle>
          <DialogDescription>
            Create a new knowledge base for storing and searching documents.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Knowledge Base Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter knowledge base name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Create a new knowledge base for storing and searching documents.
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="embeddingModel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Embedding Model</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select embedding model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {modelLoading ? (
                        <SelectItem value="loading">Loading...</SelectItem>
                      ) : (
                        selectOptions.map((item) => {
                          const label =
                            item.provider && item.model
                              ? `${item.provider} . ${item.model}`
                              : item.model || item.id;
                          return (
                            <SelectItem key={item.id} value={item.id}>
                              {label}
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select vector embedding model for your knowledge base.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="collectionName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collection name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter collection name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Collection name must contain only lowercase letters and numbers.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
