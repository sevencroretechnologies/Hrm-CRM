import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { crmProductService, crmProductCategoryService } from '../../../services/api';
import { showAlert, showConfirmDialog, getErrorMessage } from '../../../lib/sweetalert';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Package } from 'lucide-react';

interface ProductCategory {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  code: string | null;
  category_id: number | null;
  category?: ProductCategory;
  stock: number;
  amount: number;
  created_at: string;
  description: string | null;
  long_description: string | null;
}

export default function ProductList() {
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  const fetchCategories = async () => {
    try {
      const response = await crmProductCategoryService.getAll();
      const data = response.data;
      setCategories(Array.isArray(data) ? data : (data?.data || []));
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchItems = useCallback(async (currentPage: number = 1) => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        per_page: perPage,
        search,
      };
      if (categoryFilter !== 'all') {
        params.category_id = categoryFilter;
      }

      const response = await crmProductService.getAll(params);
      const responseData = response.data;
      
      if (responseData?.data && Array.isArray(responseData.data)) {
        setItems(responseData.data);
        setTotalRows(responseData.total || responseData.data.length);
      } else if (Array.isArray(responseData)) {
        setItems(responseData);
        setTotalRows(responseData.length);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [perPage, search, categoryFilter]);

  useEffect(() => {
    fetchItems(page);
    fetchCategories();
  }, [page, fetchItems]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleDelete = async (id: number) => {
    const result = await showConfirmDialog(
      'Delete Product',
      'Are you sure you want to delete this product? This action cannot be undone.'
    );
    if (!result.isConfirmed) return;

    try {
      await crmProductService.delete(id);
      showAlert('success', 'Deleted!', 'Product deleted successfully', 2000);
      fetchItems(page);
    } catch (error) {
      showAlert('error', 'Error', getErrorMessage(error, 'Failed to delete product'));
    }
  };

  const columns: TableColumn<Product>[] = [
    {
      name: 'Product Name',
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => (
        <div className="flex flex-col py-2">
          <span className="font-medium">{row.name}</span>
          {row.code && <span className="text-xs text-muted-foreground">{row.code}</span>}
        </div>
      ),
    },
    {
      name: 'Category',
      selector: (row) => row.category?.name || '',
      sortable: true,
      cell: (row) => (
        row.category ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            {row.category.name}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      ),
    },
    {
      name: 'Stock',
      selector: (row) => row.stock,
      sortable: true,
      width: '100px',
    },
    {
      name: 'Amount',
      selector: (row) => row.amount,
      sortable: true,
      cell: (row) => <span>₹{Number(row.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>,
      width: '120px',
    },
    {
      name: 'Actions',
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/crm/products/${row.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(row.id)} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      width: '80px',
    },
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#f9fafb',
        borderBottomWidth: '1px',
        borderBottomColor: '#e5e7eb',
        borderBottomStyle: 'solid' as const,
        minHeight: '56px',
      },
    },
    headCells: {
      style: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Products & Services</h1>
          <p className="text-muted-foreground">Manage your product catalog and inventory</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" asChild>
                <Link to="/crm/product-categories">
                    Categories
                </Link>
            </Button>
            <Button asChild className="bg-solarized-blue hover:bg-solarized-blue/90">
                <Link to="/crm/products/new">
                    <Plus className="mr-2 h-4 w-4" /> Add Product
                </Link>
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
                <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
                </div>
                <Button type="submit" variant="outline">Search</Button>
            </form>
            <div className="w-full md:w-64">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!isLoading && items.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No products found</p>
              <p className="text-muted-foreground">Try adjusting your filters or add a new product</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={items}
              progressPending={isLoading}
              pagination
              paginationServer
              paginationTotalRows={totalRows}
              paginationDefaultPage={page}
              onChangePage={(p) => setPage(p)}
              onChangeRowsPerPage={(pp) => setPerPage(pp)}
              customStyles={customStyles}
              highlightOnHover
              responsive
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
