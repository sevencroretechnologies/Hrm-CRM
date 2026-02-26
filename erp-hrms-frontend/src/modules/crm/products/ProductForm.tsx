import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { crmProductService, crmProductCategoryService } from '../../../services/api';
import { showAlert, getErrorMessage } from '../../../lib/sweetalert';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { ArrowLeft, Save, X } from 'lucide-react';

interface ProductCategory {
  id: number;
  name: string;
}

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category_id: '' as string | number,
    stock: 0,
    amount: 0,
    description: '',
    long_description: '',
    slug: '',
  });

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchProduct(Number(id));
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await crmProductCategoryService.getAll();
      const data = response.data;
      setCategories(Array.isArray(data) ? data : (data?.data || []));
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProduct = async (productId: number) => {
    setIsLoading(true);
    try {
      const response = await crmProductService.getById(productId);
      const data = response.data;
      setFormData({
        name: data.name || '',
        code: data.code || '',
        category_id: data.category_id || '',
        stock: data.stock || 0,
        amount: data.amount || 0,
        description: data.description || '',
        long_description: data.long_description || '',
        slug: data.slug || '',
      });
    } catch (error) {
      showAlert('error', 'Error', 'Failed to fetch product details');
      navigate('/crm/products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        category_id: formData.category_id || null,
        code: formData.code || null,
        description: formData.description || null,
        long_description: formData.long_description || null,
        slug: formData.slug || null,
      };

      if (isEdit) {
        await crmProductService.update(Number(id), payload);
        showAlert('success', 'Success', 'Product updated successfully', 2000);
      } else {
        await crmProductService.create(payload);
        showAlert('success', 'Success', 'Product created successfully', 2000);
      }
      navigate('/crm/products');
    } catch (error) {
      showAlert('error', 'Error', getErrorMessage(error, 'Failed to save product'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading product data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/crm/products">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="text-muted-foreground">Fill in the details below to {isEdit ? 'update' : 'create'} a product</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g. Premium Support Plan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Product Code / SKU</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. PSP-001"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category_id">Category</Label>
                <Select
                  value={formData.category_id?.toString()}
                  onValueChange={(v) => setFormData({ ...formData, category_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL friendly name)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. premium-support-plan"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing & Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount / Price (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Initial Stock Level</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Descriptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Short Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="A brief summary of the product..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="long_description">Detailed Specification</Label>
              <Textarea
                id="long_description"
                value={formData.long_description}
                onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                placeholder="Detailed features, terms, or specifications..."
                rows={5}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" asChild>
            <Link to="/crm/products">
              <X className="mr-2 h-4 w-4" /> Cancel
            </Link>
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-solarized-blue hover:bg-solarized-blue/90">
            {isSubmitting ? (
              'Saving...'
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Product
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
