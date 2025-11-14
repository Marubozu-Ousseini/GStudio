import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { type Product, insertProductSchema } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = insertProductSchema.extend({
  price: z.coerce.number().min(1, "Le prix doit être supérieur à 0"),
  salePrice: z.coerce.number().optional().nullable(),
});

type FormData = z.infer<typeof formSchema>;

interface ProductFormProps {
  product?: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.imageUrl || null
  );
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || 0,
      salePrice: product?.salePrice || null,
      category: product?.category || "clothes",
      imageUrl: product?.imageUrl || "",
      materials: product?.materials || "",
      care: product?.care || "",
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      let imageUrl = data.imageUrl;

      // Upload image if new file selected
      if (imageFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("image", imageFile);

        const uploadRes = await apiRequest("/api/upload", {
          method: "POST",
          body: formData,
          isFormData: true,
        });

        imageUrl = uploadRes.imageUrl;
        setIsUploading(false);
      }

      const productData = {
        ...data,
        imageUrl,
        salePrice: data.salePrice || null,
      };

      if (product) {
        return apiRequest(`/api/products/${product.id}`, {
          method: "PATCH",
          body: JSON.stringify(productData),
        });
      } else {
        return apiRequest("/api/products", {
          method: "POST",
          body: JSON.stringify(productData),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Succès",
        description: product
          ? "Produit mis à jour avec succès"
          : "Produit créé avec succès",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'enregistrer le produit",
        variant: "destructive",
      });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(product?.imageUrl || null);
  };

  const onSubmit = (data: FormData) => {
    saveMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du produit</FormLabel>
              <FormControl>
                <Input {...field} data-testid="input-product-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={3}
                  data-testid="input-product-description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix (XAF)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    data-testid="input-product-price"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="salePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix Promo (XAF) - Optionnel</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value || ""}
                    data-testid="input-product-saleprice"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-product-category">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="clothes">Vêtements</SelectItem>
                  <SelectItem value="perfumes">Parfums</SelectItem>
                  <SelectItem value="accessories">Accessoires</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="materials"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Matériaux - Optionnel</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ""}
                  data-testid="input-product-materials"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="care"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instructions d'entretien - Optionnel</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ""}
                  rows={2}
                  data-testid="input-product-care"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Image du produit</FormLabel>
          {imagePreview && (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Aperçu"
                className="h-32 w-32 object-cover rounded border"
                data-testid="img-product-preview"
              />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={handleRemoveImage}
                data-testid="button-remove-image"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          <div>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              data-testid="input-product-image"
            />
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG ou WebP (max 5MB)
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={saveMutation.isPending || isUploading}
            data-testid="button-cancel"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={saveMutation.isPending || isUploading}
            data-testid="button-save-product"
          >
            {(saveMutation.isPending || isUploading) && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            {isUploading
              ? "Téléchargement..."
              : saveMutation.isPending
              ? "Enregistrement..."
              : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
