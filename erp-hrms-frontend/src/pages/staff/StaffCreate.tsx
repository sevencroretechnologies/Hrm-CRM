import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { staffService, settingsService, contractService, contractTypeService, documentService, documentTypeService } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { ArrowLeft, Loader2, AlertCircle, FileText, X, Upload } from 'lucide-react';
import { showAlert, getErrorMessage } from '../../lib/sweetalert';

interface SelectOption {
  id: number;
  title: string;
}

interface ContractTypeOption {
  id: number;
  title: string;
  default_duration_months?: number;
}

interface FieldErrors {
  [key: string]: string | undefined;
}

/** Add `months` to a yyyy-mm-dd string, returning yyyy-mm-dd. */
const addMonthsToDate = (dateStr: string, months: number): string => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return '';
  const date = new Date(y, m - 1, d);
  date.setMonth(date.getMonth() + months);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
};

export default function StaffCreate() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [locations, setLocations] = useState<SelectOption[]>([]);
  const [divisions, setDivisions] = useState<SelectOption[]>([]);
  const [jobTitles, setJobTitles] = useState<SelectOption[]>([]);
  const [contractTypes, setContractTypes] = useState<ContractTypeOption[]>([]);
  
  // Documents state
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [pendingDocuments, setPendingDocuments] = useState<{ typeId: string; typeName: string; file: File }[]>([]);
  const [selectedDocType, setSelectedDocType] = useState<string>('');
  const [selectedDocFile, setSelectedDocFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    profile_image: null as File | null,
    profile_image_preview: '',
    email: '',
    personal_email: '',
    mobile_number: '',
    birth_date: '',
    gender: '',
    home_address: '',
    nationality: '',
    passport_number: '',
    country_code: '',
    region: '',
    city_name: '',
    postal_code: '',
    biometric_id: '',
    office_location_id: '',
    division_id: '',
    job_title_id: '',
    hire_date: '',
    employment_status: '',
    employment_type: 'full_time',
    compensation_type: 'monthly',
    base_salary: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
  });

  // Optional initial contract for the new employee.
  const [contractData, setContractData] = useState({
    create_contract: false,
    contract_type_id: '',
    start_date: '',
    end_date: '',
    salary: '',
    terms: '',
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [locRes, divRes, jobRes, ctRes, docRes] = await Promise.all([
          settingsService.getOfficeLocations(),
          settingsService.getDivisions(),
          settingsService.getJobTitles(),
          contractTypeService.getAll({ per_page: 100 }),
          documentTypeService.getAll({ page: 1, per_page: 100 }),
        ]);
        setLocations(locRes.data.data || []);
        setDivisions(divRes.data.data || []);
        setJobTitles(jobRes.data.data || []);
        setContractTypes(ctRes.data.data || []);
        setDocumentTypes(docRes.data.data || []);
      } catch (error) {
        console.error('Failed to fetch options:', error);
      }
    };
    fetchOptions();
  }, []);

  const handleAddDocument = () => {
    if (!selectedDocType || !selectedDocFile) return;
    
    const docTypeObj = documentTypes.find(t => t.id.toString() === selectedDocType);
    const typeName = docTypeObj ? docTypeObj.title : 'Document';
    
    setPendingDocuments(prev => [...prev, { typeId: selectedDocType, typeName, file: selectedDocFile }]);
    setSelectedDocType('');
    setSelectedDocFile(null);
    
    // Clear input
    const fileInput = document.getElementById('doc_file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleRemoveDocument = (index: number) => {
    setPendingDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleContractChange = (name: string, value: string) => {
    setContractData(prev => {
      const next = { ...prev, [name]: value };
      // Auto-fill end_date from the contract type's default duration.
      if (name === 'contract_type_id' || name === 'start_date') {
        const typeId = name === 'contract_type_id' ? value : prev.contract_type_id;
        const start = name === 'start_date' ? value : prev.start_date;
        const type = contractTypes.find(t => t.id.toString() === typeId);
        const duration = type?.default_duration_months;
        if (duration && duration > 0 && start && (!prev.end_date || name === 'contract_type_id')) {
          next.end_date = addMonthsToDate(start, duration);
        }
      }
      return next;
    });
    const errKey = `contract_${name === 'start_date' ? 'start_date' : name === 'end_date' ? 'end_date' : name}`;
    if (fieldErrors[errKey]) {
      setFieldErrors(prev => ({ ...prev, [errKey]: undefined }));
    }
  };

  const selectedContractType = contractTypes.find(
    t => t.id.toString() === contractData.contract_type_id
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // Keep the contract salary in sync with base salary while the contract section is active.
    if (name === 'base_salary') {
      setContractData(prev => (prev.create_contract ? { ...prev, salary: value } : prev));
      setFieldErrors(prev => (prev.contract_salary ? { ...prev, contract_salary: undefined } : prev));
    }
    // Keep the contract start date aligned with hire date until the user edits it.
    if (name === 'hire_date') {
      setContractData(prev =>
        prev.create_contract && (!prev.start_date || prev.start_date === '') ? { ...prev, start_date: value } : prev
      );
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // Selecting "Contract" (or "Intern") as the employment type turns on the
    // contract section automatically; switching back to a permanent type turns it off.
    if (name === 'employment_type') {
      const contractLike = value === 'contract' || value === 'intern';
      setContractData(prev => ({
        ...prev,
        create_contract: contractLike,
        start_date: contractLike && !prev.start_date ? (formData.hire_date || '') : prev.start_date,
        salary: contractLike && !prev.salary ? (formData.base_salary || '') : prev.salary,
      }));
      if (!contractLike) {
        // Clear any stale contract validation errors when it's no longer required.
        setFieldErrors(prev => ({
          ...prev,
          contract_contract_type_id: undefined,
          contract_start_date: undefined,
          contract_end_date: undefined,
          contract_salary: undefined,
        }));
      }
    }
  };

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};
    let isValid = true;

    // Helper to validate required fields
    const validateRequired = (field: keyof typeof formData, label: string) => {
      if (!formData[field] || (typeof formData[field] === 'string' && !formData[field].trim())) {
        errors[field] = `${label} is required`;
        isValid = false;
      }
    };

    // Personal Information
    validateRequired('full_name', 'Full Name');

    validateRequired('email', 'Work Email');
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    validateRequired('personal_email', 'Personal Email');
    if (formData.personal_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personal_email)) {
      errors.personal_email = 'Please enter a valid email address';
      isValid = false;
    }

    validateRequired('mobile_number', 'Mobile Number');
    if (formData.mobile_number && !/^\d{10}$/.test(formData.mobile_number)) {
      errors.mobile_number = 'Mobile number must be exactly 10 digits';
      isValid = false;
    }

    validateRequired('birth_date', 'Date of Birth');
    validateRequired('gender', 'Gender');

    // Address
    validateRequired('home_address', 'Home Address');
    validateRequired('city_name', 'City');
    validateRequired('region', 'Region/State');
    validateRequired('country_code', 'Country Code');
    validateRequired('postal_code', 'Postal Code');
    validateRequired('nationality', 'Nationality');
    validateRequired('passport_number', 'Passport Number');

    // Employment Details
    validateRequired('office_location_id', 'Office Location');
    validateRequired('division_id', 'Department');
    validateRequired('job_title_id', 'Designation');
    validateRequired('hire_date', 'Hire Date');
    validateRequired('employment_status', 'Employment Status');
    validateRequired('employment_type', 'Employment Type');
    validateRequired('compensation_type', 'Compensation Type');
    validateRequired('base_salary', 'Base Salary');

    // Emergency Contact
    validateRequired('emergency_contact_name', 'Contact Name');
    validateRequired('emergency_contact_phone', 'Contact Phone');
    validateRequired('emergency_contact_relationship', 'Relationship');

    // Optional contract — only validate when the user opted in.
    if (contractData.create_contract) {
      if (!contractData.contract_type_id) {
        errors.contract_contract_type_id = 'Contract type is required';
        isValid = false;
      }
      if (!contractData.start_date) {
        errors.contract_start_date = 'Contract start date is required';
        isValid = false;
      }
      if (!contractData.end_date) {
        errors.contract_end_date = 'Contract end date is required';
        isValid = false;
      } else if (contractData.start_date) {
        const start = new Date(contractData.start_date);
        const end = new Date(contractData.end_date);
        if (isNaN(end.getTime())) {
          errors.contract_end_date = 'Invalid contract end date';
          isValid = false;
        } else if (end <= start) {
          errors.contract_end_date = 'Contract end date must be after start date';
          isValid = false;
        } else {
          const type = contractTypes.find(t => t.id.toString() === contractData.contract_type_id);
          const duration = type?.default_duration_months;
          if (duration && duration > 0) {
            const maxEnd = addMonthsToDate(contractData.start_date, duration);
            if (maxEnd && contractData.end_date > maxEnd) {
              errors.contract_end_date = `End date cannot be more than ${duration} month${duration === 1 ? '' : 's'} after the start date (max ${maxEnd}) for "${type?.title}"`;
              isValid = false;
            }
          }
        }
      }
      if (contractData.salary && contractData.salary.trim() !== '') {
        const sal = Number(contractData.salary);
        if (isNaN(sal)) {
          errors.contract_salary = 'Contract salary must be a number';
          isValid = false;
        } else if (sal < 0) {
          errors.contract_salary = 'Contract salary cannot be negative';
          isValid = false;
        }
      }
    }

    setFieldErrors(errors);

    if (!isValid) {
      // showAlert('error', 'Validation Error', 'Please fix the errors in the form');

      // Focus first error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.focus();
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();

      // Add all form fields except profile_image_preview
      Object.keys(formData).forEach(key => {
        if (key === 'profile_image_preview') return;

        const value = formData[key as keyof typeof formData];

        // Skip null/undefined/empty values except for profile_image which is a File
        if (value === null || value === undefined) return;
        if (typeof value === 'string' && value === '') return;

        formDataToSend.append(key, value as string | Blob);
      });

      const staffRes = await staffService.create(formDataToSend);
      const newStaffId = staffRes?.data?.data?.id;

      // Upload documents if any
      if (newStaffId && pendingDocuments.length > 0) {
        try {
          await Promise.all(pendingDocuments.map(doc => {
            const docFormData = new FormData();
            docFormData.append('file', doc.file);
            docFormData.append('document_type_id', doc.typeId);
            docFormData.append('owner_type', 'employee');
            docFormData.append('owner_id', String(newStaffId));
            return documentService.upload(Number(newStaffId), docFormData);
          }));
        } catch (docErr) {
          console.error('Failed to upload some documents:', docErr);
          showAlert('warning', 'Partial Success', 'Staff created, but some documents failed to upload.');
        }
      }

      // Optionally create an initial contract for the newly created staff member.
      if (contractData.create_contract) {
        if (newStaffId) {
          try {
            await contractService.createContract({
              staff_member_id: newStaffId,
              contract_type_id: contractData.contract_type_id ? parseInt(contractData.contract_type_id) : null,
              start_date: contractData.start_date,
              end_date: contractData.end_date,
              salary: contractData.salary ? parseFloat(contractData.salary) : null,
              terms: contractData.terms || null,
            });
            showAlert('success', 'Success!', 'Staff member and contract created successfully', 2000);
          } catch (contractErr) {
            console.error('Failed to create contract:', contractErr);
            showAlert(
              'warning',
              'Staff created — contract failed',
              getErrorMessage(contractErr, 'The staff member was created but the contract could not be added. You can add it from the Contracts page.')
            );
          }
        } else {
          showAlert('success', 'Success!', 'Staff member created successfully', 2000);
        }
      } else {
        showAlert('success', 'Success!', 'Staff member created successfully', 2000);
      }

      navigate('/staff');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const errorMessage = getErrorMessage(err, 'Failed to create staff member');

      if (error.response?.data?.errors) {
        const apiErrors: FieldErrors = {};
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(key => {
          apiErrors[key] = errors[key][0];
        });
        setFieldErrors(apiErrors);

        // Focus first API error
        const firstErrorField = Object.keys(apiErrors)[0];
        if (firstErrorField) {
          const element = document.getElementById(firstErrorField);
          if (element) {
            element.focus();
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }

      setError(errorMessage);
      showAlert('error', 'Creation Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderError = (field: string) => {
    return fieldErrors[field] ? (
      <p className="text-sm text-red-500 mt-1">{fieldErrors[field]}</p>
    ) : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-solarized-base02">Add New Staff</h1>
          <p className="text-solarized-base01">Create a new employee record</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Basic details about the employee</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name" className={fieldErrors.full_name ? 'text-red-500' : ''}>Full Name *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  aria-invalid={!!fieldErrors.full_name}
                />
                {renderError('full_name')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile_image">Profile Image</Label>
                <Input
                  id="profile_image"
                  name="profile_image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Create preview
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({
                          ...formData,
                          profile_image: file,
                          profile_image_preview: reader.result as string
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {formData.profile_image_preview && (
                  <div className="mt-2">
                    <img
                      src={formData.profile_image_preview}
                      alt="Profile preview"
                      className="h-20 w-20 rounded-full object-cover border-2 border-solarized-blue"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="personal_email" className={fieldErrors.personal_email ? 'text-red-500' : ''}>Personal Email *</Label>
                <Input
                  id="personal_email"
                  name="personal_email"
                  type="email"
                  value={formData.personal_email}
                  onChange={handleChange}
                  placeholder="john.doe@gmail.com"
                  aria-invalid={!!fieldErrors.personal_email}
                />
                {renderError('personal_email')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className={fieldErrors.email ? 'text-red-500' : ''}>Work Email (Login) *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@company.com"
                  aria-invalid={!!fieldErrors.email}
                />
                {renderError('email')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile_number" className={fieldErrors.mobile_number ? 'text-red-500' : ''}>Mobile Number *</Label>
                <Input
                  id="mobile_number"
                  name="mobile_number"
                  value={formData.mobile_number}
                  onChange={handleChange}
                  placeholder="9876543210"
                  maxLength={10}
                  aria-invalid={!!fieldErrors.mobile_number}
                />
                {renderError('mobile_number')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="birth_date" className={fieldErrors.birth_date ? 'text-red-500' : ''}>Date of Birth *</Label>
                <Input
                  id="birth_date"
                  name="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  aria-invalid={!!fieldErrors.birth_date}
                />
                {renderError('birth_date')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender" className={fieldErrors.gender ? 'text-red-500' : ''}>Gender *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleSelectChange('gender', value)}
                >
                  <SelectTrigger id="gender" aria-invalid={!!fieldErrors.gender}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {renderError('gender')}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Address</CardTitle>
              <CardDescription>Employee's residential address</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="home_address" className={fieldErrors.home_address ? 'text-red-500' : ''}>Home Address *</Label>
                <Textarea
                  id="home_address"
                  name="home_address"
                  value={formData.home_address}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Flat 101, MG Road, Indiranagar"
                  aria-invalid={!!fieldErrors.home_address}
                />
                {renderError('home_address')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city_name" className={fieldErrors.city_name ? 'text-red-500' : ''}>City *</Label>
                <Input
                  id="city_name"
                  name="city_name"
                  value={formData.city_name}
                  onChange={handleChange}
                  placeholder="Bengaluru"
                  aria-invalid={!!fieldErrors.city_name}
                />
                {renderError('city_name')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="region" className={fieldErrors.region ? 'text-red-500' : ''}>Region/State *</Label>
                <Input
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  placeholder="Karnataka"
                  aria-invalid={!!fieldErrors.region}
                />
                {renderError('region')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="country_code" className={fieldErrors.country_code ? 'text-red-500' : ''}>Country Code *</Label>
                <Input
                  id="country_code"
                  name="country_code"
                  value={formData.country_code}
                  onChange={handleChange}
                  maxLength={3}
                  placeholder="+91"
                  aria-invalid={!!fieldErrors.country_code}
                />
                {renderError('country_code')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal_code" className={fieldErrors.postal_code ? 'text-red-500' : ''}>Postal Code *</Label>
                <Input
                  id="postal_code"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  placeholder="560038"
                  aria-invalid={!!fieldErrors.postal_code}
                />
                {renderError('postal_code')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality" className={fieldErrors.nationality ? 'text-red-500' : ''}>Nationality *</Label>
                <Input
                  id="nationality"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  placeholder="Indian"
                  aria-invalid={!!fieldErrors.nationality}
                />
                {renderError('nationality')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="passport_number" className={fieldErrors.passport_number ? 'text-red-500' : ''}>Passport Number *</Label>
                <Input
                  id="passport_number"
                  name="passport_number"
                  value={formData.passport_number}
                  onChange={handleChange}
                  placeholder="A12345678"
                  aria-invalid={!!fieldErrors.passport_number}
                />
                {renderError('passport_number')}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Employment Details</CardTitle>
              <CardDescription>Job and compensation information</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="office_location_id" className={fieldErrors.office_location_id ? 'text-red-500' : ''}>Office Location *</Label>
                <Select
                  value={formData.office_location_id}
                  onValueChange={(value) => handleSelectChange('office_location_id', value)}
                >
                  <SelectTrigger id="office_location_id" aria-invalid={!!fieldErrors.office_location_id}>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id.toString()}>
                        {loc.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {renderError('office_location_id')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="division_id" className={fieldErrors.division_id ? 'text-red-500' : ''}>Department *</Label>
                <Select
                  value={formData.division_id}
                  onValueChange={(value) => handleSelectChange('division_id', value)}
                >
                  <SelectTrigger id="division_id" aria-invalid={!!fieldErrors.division_id}>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map((div) => (
                      <SelectItem key={div.id} value={div.id.toString()}>
                        {div.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {renderError('division_id')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="job_title_id" className={fieldErrors.job_title_id ? 'text-red-500' : ''}>Designation *</Label>
                <Select
                  value={formData.job_title_id}
                  onValueChange={(value) => handleSelectChange('job_title_id', value)}
                >
                  <SelectTrigger id="job_title_id" aria-invalid={!!fieldErrors.job_title_id}>
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTitles.map((job) => (
                      <SelectItem key={job.id} value={job.id.toString()}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {renderError('job_title_id')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="hire_date" className={fieldErrors.hire_date ? 'text-red-500' : ''}>Hire Date *</Label>
                <Input
                  id="hire_date"
                  name="hire_date"
                  type="date"
                  value={formData.hire_date}
                  onChange={handleChange}
                  aria-invalid={!!fieldErrors.hire_date}
                />
                {renderError('hire_date')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="employment_status" className={fieldErrors.employment_status ? 'text-red-500' : ''}>Employment Status *</Label>
                <Select
                  value={formData.employment_status}
                  onValueChange={(value) => handleSelectChange('employment_status', value)}
                >
                  <SelectTrigger id="employment_status" aria-invalid={!!fieldErrors.employment_status}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                    <SelectItem value="resigned">Resigned</SelectItem>
                  </SelectContent>
                </Select>
                {renderError('employment_status')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="employment_type" className={fieldErrors.employment_type ? 'text-red-500' : ''}>Employment Type *</Label>
                <Select
                  value={formData.employment_type}
                  onValueChange={(value) => handleSelectChange('employment_type', value)}
                >
                  <SelectTrigger id="employment_type" aria-invalid={!!fieldErrors.employment_type}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full Time</SelectItem>
                    <SelectItem value="part_time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="intern">Intern</SelectItem>
                  </SelectContent>
                </Select>
                {renderError('employment_type')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="compensation_type" className={fieldErrors.compensation_type ? 'text-red-500' : ''}>Compensation Type *</Label>
                <Select
                  value={formData.compensation_type}
                  onValueChange={(value) => handleSelectChange('compensation_type', value)}
                >
                  <SelectTrigger id="compensation_type" aria-invalid={!!fieldErrors.compensation_type}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
                {renderError('compensation_type')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="base_salary" className={fieldErrors.base_salary ? 'text-red-500' : ''}>Base Salary *</Label>
                <Input
                  id="base_salary"
                  name="base_salary"
                  type="number"
                  value={formData.base_salary}
                  onChange={handleChange}
                  placeholder="50000"
                  aria-invalid={!!fieldErrors.base_salary}
                />
                {renderError('base_salary')}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
              <CardDescription>Person to contact in case of emergency</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name" className={fieldErrors.emergency_contact_name ? 'text-red-500' : ''}>Contact Name *</Label>
                <Input
                  id="emergency_contact_name"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                  aria-invalid={!!fieldErrors.emergency_contact_name}
                />
                {renderError('emergency_contact_name')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone" className={fieldErrors.emergency_contact_phone ? 'text-red-500' : ''}>Contact Phone *</Label>
                <Input
                  id="emergency_contact_phone"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleChange}
                  maxLength={10}
                  placeholder="9876543210"
                  aria-invalid={!!fieldErrors.emergency_contact_phone}
                />
                {renderError('emergency_contact_phone')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_relationship" className={fieldErrors.emergency_contact_relationship ? 'text-red-500' : ''}>Relationship *</Label>
                <Input
                  id="emergency_contact_relationship"
                  name="emergency_contact_relationship"
                  value={formData.emergency_contact_relationship}
                  onChange={handleChange}
                  placeholder="Spouse"
                  aria-invalid={!!fieldErrors.emergency_contact_relationship}
                />
                {renderError('emergency_contact_relationship')}
              </div>
            </CardContent>
          </Card>

          {/* CONTRACT — auto-enabled when employment type is Contract / Intern */}
          {(() => {
            const isContractEmployment =
              formData.employment_type === 'contract' || formData.employment_type === 'intern';
            return (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>{isContractEmployment ? 'Contract' : 'Contract (Optional)'}</CardTitle>
              <CardDescription>
                {isContractEmployment
                  ? 'Employment type is Contract / Intern — add the contract details below.'
                  : 'Create an initial employment contract for this employee'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="create_contract"
                  checked={contractData.create_contract}
                  disabled={isContractEmployment}
                  onCheckedChange={(checked) => {
                    const enabled = checked === true;
                    setContractData(prev => ({
                      ...prev,
                      create_contract: enabled,
                      // Seed sensible defaults when enabling.
                      start_date: enabled && !prev.start_date ? (formData.hire_date || '') : prev.start_date,
                      salary: enabled && !prev.salary ? (formData.base_salary || '') : prev.salary,
                    }));
                  }}
                />
                <Label htmlFor="create_contract" className={isContractEmployment ? '' : 'cursor-pointer'}>
                  {isContractEmployment
                    ? 'Contract required for this employment type'
                    : 'Add a contract for this employee now'}
                </Label>
              </div>

              {contractData.create_contract && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contract_type_id" className={fieldErrors.contract_contract_type_id ? 'text-red-500' : ''}>
                      Contract Type *
                    </Label>
                    <Select
                      value={contractData.contract_type_id}
                      onValueChange={(value) => handleContractChange('contract_type_id', value)}
                    >
                      <SelectTrigger id="contract_type_id" aria-invalid={!!fieldErrors.contract_contract_type_id}>
                        <SelectValue placeholder="Select contract type" />
                      </SelectTrigger>
                      <SelectContent>
                        {contractTypes.map((type) => (
                          <SelectItem key={type.id} value={String(type.id)}>
                            {type.title}{type.default_duration_months ? ` (${type.default_duration_months} mo)` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {renderError('contract_contract_type_id')}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contract_salary" className={fieldErrors.contract_salary ? 'text-red-500' : ''}>
                      Contract Salary
                    </Label>
                    <Input
                      id="contract_salary"
                      type="number"
                      min="0"
                      value={contractData.salary}
                      onChange={(e) => handleContractChange('salary', e.target.value)}
                      placeholder="50000"
                      aria-invalid={!!fieldErrors.contract_salary}
                    />
                    {renderError('contract_salary')}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contract_start_date" className={fieldErrors.contract_start_date ? 'text-red-500' : ''}>
                      Start Date *
                    </Label>
                    <Input
                      id="contract_start_date"
                      type="date"
                      value={contractData.start_date}
                      onChange={(e) => handleContractChange('start_date', e.target.value)}
                      aria-invalid={!!fieldErrors.contract_start_date}
                    />
                    {renderError('contract_start_date')}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contract_end_date" className={fieldErrors.contract_end_date ? 'text-red-500' : ''}>
                      End Date *
                    </Label>
                    <Input
                      id="contract_end_date"
                      type="date"
                      value={contractData.end_date}
                      min={contractData.start_date || undefined}
                      max={
                        selectedContractType?.default_duration_months && contractData.start_date
                          ? addMonthsToDate(contractData.start_date, selectedContractType.default_duration_months)
                          : undefined
                      }
                      onChange={(e) => handleContractChange('end_date', e.target.value)}
                      aria-invalid={!!fieldErrors.contract_end_date}
                    />
                    {selectedContractType?.default_duration_months ? (
                      <p className="text-xs text-solarized-base01">
                        Max {selectedContractType.default_duration_months} month
                        {selectedContractType.default_duration_months === 1 ? '' : 's'} from start date for "{selectedContractType.title}".
                      </p>
                    ) : null}
                    {renderError('contract_end_date')}
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="contract_terms">Terms</Label>
                    <Textarea
                      id="contract_terms"
                      value={contractData.terms}
                      onChange={(e) => handleContractChange('terms', e.target.value)}
                      placeholder="Contract terms and conditions..."
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
            );
          })()}

          {/* DOCUMENTS */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Upload necessary documents for this employee</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-12 items-end">
                <div className="sm:col-span-4 space-y-2">
                  <Label htmlFor="doc_type">Document Type</Label>
                  <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                    <SelectTrigger id="doc_type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map(t => (
                        <SelectItem key={t.id} value={String(t.id)}>{t.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-6 space-y-2">
                  <Label htmlFor="doc_file">File</Label>
                  <Input 
                    id="doc_file" 
                    type="file" 
                    onChange={e => setSelectedDocFile(e.target.files?.[0] || null)} 
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button 
                    type="button" 
                    className="w-full" 
                    onClick={handleAddDocument}
                    disabled={!selectedDocType || !selectedDocFile}
                  >
                    <Upload className="mr-2 h-4 w-4" /> Add
                  </Button>
                </div>
              </div>

              {pendingDocuments.length > 0 && (
                <div className="mt-4 rounded-md border p-4 space-y-3">
                  <h4 className="text-sm font-medium">Pending Documents</h4>
                  {pendingDocuments.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-solarized-blue" />
                        <span className="text-sm font-medium">{doc.typeName}</span>
                        <span className="text-xs text-gray-500">({doc.file.name})</span>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700 h-8 w-8 p-0" 
                        onClick={() => handleRemoveDocument(idx)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-solarized-blue hover:bg-solarized-blue/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Staff'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
