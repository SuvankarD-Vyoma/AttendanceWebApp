"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { saveEmployee, getAllBloodGroup, getAllGender } from "./api";
import { Upload, User, Mail, Phone, MapPin, Calendar, Briefcase, Shield, X, Image, ArrowLeft } from "lucide-react";

export default function AddEmployeePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [genders, setGenders] = useState([]);
    const [bloodGroups, setBloodGroups] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);
    const [qrPreview, setQrPreview] = useState(null);
    const [form, setForm] = useState({
        emp_full_name: "",
        emp_code: "",
        emp_personal_contact_no: "",
        emp_personal_email: "",
        emp_alternate_contact_no: "",
        emp_official_email: "",
        doj: "",
        designation_type_id: 0,
        department_id: 0,
        dob: "",
        gender_id: 0,
        blood_group_id: 0,
        maritial_status_id: 0,
        nationality: "",
        emp_current_address: "",
        emp_current_address_postal_code: "",
        emp_prmnt_address: "",
        emp_prmnt_postal_code: "",
        emp_emrgncy_contact_no: "",
        emp_emrgncy_contact_name: "",
        emp_img: "",
        emp_qr: "",
        emp_identity_type_id: "",
        emp_identity_no: "",
    });
    useEffect(() => {
        const fetchBloodGroups = async () => {
            try {
                const response = await getAllBloodGroup();
                setBloodGroups(response.data);
            } catch (error) {
                console.error("Error fetching blood groups:", error);
            }
        };
        fetchBloodGroups();
    }, []);
    useEffect(() => {
        const fetchGenders = async () => {
            try {
                const response = await getAllGender();
                setGenders(response.data);
            } catch (error) {
                console.error("Error fetching genders:", error);
            }
        };
        fetchGenders();
    }, []);
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setForm({ ...form, emp_img: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };
    const handleQrUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setQrPreview(reader.result);
                setForm({ ...form, emp_qr: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };
    const removeImage = () => {
        setImagePreview(null);
        setForm({ ...form, emp_img: "" });
    };
    const removeQr = () => {
        setQrPreview(null);
        setForm({ ...form, emp_qr: "" });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Set admin_id and entry_user_id to the same specified value
            const adminId = "sQ%2BxhJuU18aS3q5hDfljHbL%2Bb4uMQEHjiOm2J4dI";
            const entryUserId = adminId;
            const response = await saveEmployee({
                emp_id: 0,
                org_id: 1,
                ...form,
                emp_national_identity_info: {
                    emp_identity_type_id: form.emp_identity_type_id,
                    emp_identity_no: form.emp_identity_no,
                },
                entry_user_id: entryUserId,
                admin_id: adminId,
            });
            if (response && response.status === 200) {
                toast({ title: "Employee added successfully!" });
                router.push("/employees");
            } else {
                throw new Error(
                    response?.message ||
                    "Employee could not be added. Please try again."
                );
            }
        } catch (err) {
            toast({ title: "Error", description: err.message || "API error", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };
    const getCookieValue = (name) => {
        if (typeof document === "undefined") return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
        return null;
    };
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <div className="mb-4">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            if (typeof window !== "undefined" && window.history.length > 1) {
                                router.back();
                            } else {
                                router.push("/employees");
                            }
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back
                    </Button>
                </div>
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                        Add New Employee
                    </h1>
                    <p className="text-slate-600">Fill in the details to register a new employee</p>
                </div>

                {/* Surround all form fields and buttons in a real <form> tag */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information Card */}
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <User className="w-5 h-5" />
                                Personal Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="emp_full_name" className="text-sm font-semibold text-slate-700">
                                        Full Name *
                                    </Label>
                                    <Input
                                        id="emp_full_name"
                                        name="emp_full_name"
                                        value={form.emp_full_name}
                                        onChange={handleChange}
                                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emp_code" className="text-sm font-semibold text-slate-700">
                                        Employee Code *
                                    </Label>
                                    <Input
                                        id="emp_code"
                                        name="emp_code"
                                        value={form.emp_code}
                                        onChange={handleChange}
                                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dob" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Date of Birth
                                    </Label>
                                    <Input
                                        id="dob"
                                        name="dob"
                                        type="date"
                                        value={form.dob}
                                        onChange={handleChange}
                                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nationality" className="text-sm font-semibold text-slate-700">
                                        Nationality
                                    </Label>
                                    <Input
                                        id="nationality"
                                        name="nationality"
                                        value={form.nationality}
                                        onChange={handleChange}
                                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gender_id" className="text-sm font-semibold text-slate-700">
                                        Gender
                                    </Label>
                                    <Select
                                        value={form.gender_id ? String(form.gender_id) : ""}
                                        onValueChange={value => setForm({ ...form, gender_id: Number(value) })}
                                    >
                                        <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                                            <SelectValue placeholder="Select Gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {genders.map(g => (
                                                <SelectItem key={g.gender_id} value={String(g.gender_id)}>
                                                    {g.gender}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="blood_group_id" className="text-sm font-semibold text-slate-700">
                                        Blood Group
                                    </Label>
                                    <Select
                                        value={form.blood_group_id ? String(form.blood_group_id) : ""}
                                        onValueChange={value => setForm({ ...form, blood_group_id: Number(value) })}
                                    >
                                        <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                                            <SelectValue placeholder="Select Blood Group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {bloodGroups.map(bg => (
                                                <SelectItem key={bg.blood_group_id} value={String(bg.blood_group_id)}>
                                                    {bg.blood_group}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maritial_status_id" className="text-sm font-semibold text-slate-700">
                                        Marital Status
                                    </Label>
                                    <Select
                                        value={form.maritial_status_id ? String(form.maritial_status_id) : ""}
                                        onValueChange={value => setForm({ ...form, maritial_status_id: Number(value) })}
                                    >
                                        <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                                            <SelectValue placeholder="Select Marital Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Married</SelectItem>
                                            <SelectItem value="2">Unmarried</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Information Card */}
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Phone className="w-5 h-5" />
                                Contact Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="emp_personal_contact_no" className="text-sm font-semibold text-slate-700">
                                        Personal Contact Number *
                                    </Label>
                                    <Input
                                        id="emp_personal_contact_no"
                                        name="emp_personal_contact_no"
                                        value={form.emp_personal_contact_no}
                                        onChange={handleChange}
                                        className="border-slate-300 focus:border-green-500 focus:ring-green-500"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emp_alternate_contact_no" className="text-sm font-semibold text-slate-700">
                                        Alternate Contact Number
                                    </Label>
                                    <Input
                                        id="emp_alternate_contact_no"
                                        name="emp_alternate_contact_no"
                                        value={form.emp_alternate_contact_no}
                                        onChange={handleChange}
                                        className="border-slate-300 focus:border-green-500 focus:ring-green-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emp_personal_email" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        Personal Email *
                                    </Label>
                                    <Input
                                        id="emp_personal_email"
                                        name="emp_personal_email"
                                        type="email"
                                        value={form.emp_personal_email}
                                        onChange={handleChange}
                                        className="border-slate-300 focus:border-green-500 focus:ring-green-500"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emp_official_email" className="text-sm font-semibold text-slate-700">
                                        Official Email
                                    </Label>
                                    <Input
                                        id="emp_official_email"
                                        name="emp_official_email"
                                        type="email"
                                        value={form.emp_official_email}
                                        onChange={handleChange}
                                        className="border-slate-300 focus:border-green-500 focus:ring-green-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emp_emrgncy_contact_name" className="text-sm font-semibold text-slate-700">
                                        Emergency Contact Name
                                    </Label>
                                    <Input
                                        id="emp_emrgncy_contact_name"
                                        name="emp_emrgncy_contact_name"
                                        value={form.emp_emrgncy_contact_name}
                                        onChange={handleChange}
                                        className="border-slate-300 focus:border-green-500 focus:ring-green-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emp_emrgncy_contact_no" className="text-sm font-semibold text-slate-700">
                                        Emergency Contact Number
                                    </Label>
                                    <Input
                                        id="emp_emrgncy_contact_no"
                                        name="emp_emrgncy_contact_no"
                                        value={form.emp_emrgncy_contact_no}
                                        onChange={handleChange}
                                        className="border-slate-300 focus:border-green-500 focus:ring-green-500"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Work Information Card */}
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Briefcase className="w-5 h-5" />
                                Work Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="doj" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Date of Joining
                                    </Label>
                                    <Input
                                        id="doj"
                                        name="doj"
                                        type="date"
                                        value={form.doj}
                                        onChange={handleChange}
                                        className="border-slate-300 focus:border-purple-500 focus:ring-purple-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="designation_type_id" className="text-sm font-semibold text-slate-700">
                                        Designation
                                    </Label>
                                    <Select
                                        value={form.designation_type_id ? String(form.designation_type_id) : ""}
                                        onValueChange={value => setForm({ ...form, designation_type_id: Number(value) })}
                                    >
                                        <SelectTrigger className="border-slate-300 focus:border-purple-500 focus:ring-purple-500">
                                            <SelectValue placeholder="Select Designation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">Software Developer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="department_id" className="text-sm font-semibold text-slate-700">
                                        Department
                                    </Label>
                                    <Select
                                        value={form.department_id ? String(form.department_id) : ""}
                                        onValueChange={value => setForm({ ...form, department_id: Number(value) })}
                                    >
                                        <SelectTrigger className="border-slate-300 focus:border-purple-500 focus:ring-purple-500">
                                            <SelectValue placeholder="Select Department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">IT</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Address Information Card */}
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <MapPin className="w-5 h-5" />
                                Address Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="emp_current_address" className="text-sm font-semibold text-slate-700">
                                        Current Address
                                    </Label>
                                    <Textarea
                                        id="emp_current_address"
                                        name="emp_current_address"
                                        value={form.emp_current_address}
                                        onChange={handleChange}
                                        rows={3}
                                        className="border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emp_prmnt_address" className="text-sm font-semibold text-slate-700">
                                        Permanent Address
                                    </Label>
                                    <Textarea
                                        id="emp_prmnt_address"
                                        name="emp_prmnt_address"
                                        value={form.emp_prmnt_address}
                                        onChange={handleChange}
                                        rows={3}
                                        className="border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emp_current_address_postal_code" className="text-sm font-semibold text-slate-700">
                                        Current Postal Code
                                    </Label>
                                    <Input
                                        id="emp_current_address_postal_code"
                                        name="emp_current_address_postal_code"
                                        value={form.emp_current_address_postal_code}
                                        onChange={handleChange}
                                        className="border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emp_prmnt_postal_code" className="text-sm font-semibold text-slate-700">
                                        Permanent Postal Code
                                    </Label>
                                    <Input
                                        id="emp_prmnt_postal_code"
                                        name="emp_prmnt_postal_code"
                                        value={form.emp_prmnt_postal_code}
                                        onChange={handleChange}
                                        className="border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Identity Information Card */}
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-t-lg">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Shield className="w-5 h-5" />
                                Identity Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="emp_identity_type_id" className="text-sm font-semibold text-slate-700">
                                        Identity Type ID
                                    </Label>
                                    <Input
                                        id="emp_identity_type_id"
                                        name="emp_identity_type_id"
                                        value={form.emp_identity_type_id}
                                        onChange={handleChange}
                                        className="border-slate-300 focus:border-cyan-500 focus:ring-cyan-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emp_identity_no" className="text-sm font-semibold text-slate-700">
                                        Identity Number
                                    </Label>
                                    <Input
                                        id="emp_identity_no"
                                        name="emp_identity_no"
                                        value={form.emp_identity_no}
                                        onChange={handleChange}
                                        className="border-slate-300 focus:border-cyan-500 focus:ring-cyan-500"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Documents Upload Card */}
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Upload className="w-5 h-5" />
                                Documents Upload
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Employee Image Upload */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <Image className="w-4 h-4" />
                                        Employee Image
                                    </Label>
                                    <div className="relative">
                                        {imagePreview ? (
                                            <div className="relative group">
                                                <img
                                                    src={imagePreview}
                                                    alt="Employee"
                                                    className="w-full h-48 object-cover rounded-lg border-2 border-slate-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={removeImage}
                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <Upload className="w-10 h-10 mb-3 text-slate-400" />
                                                    <p className="mb-2 text-sm text-slate-600">
                                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                                    </p>
                                                    <p className="text-xs text-slate-500">PNG, JPG or JPEG (MAX. 2MB)</p>
                                                </div>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {/* QR Code Upload */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <Image className="w-4 h-4" />
                                        Employee QR Code
                                    </Label>
                                    <div className="relative">
                                        {qrPreview ? (
                                            <div className="relative group">
                                                <img
                                                    src={qrPreview}
                                                    alt="QR Code"
                                                    className="w-full h-48 object-cover rounded-lg border-2 border-slate-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={removeQr}
                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <Upload className="w-10 h-10 mb-3 text-slate-400" />
                                                    <p className="mb-2 text-sm text-slate-600">
                                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                                    </p>
                                                    <p className="text-xs text-slate-500">PNG, JPG or JPEG (MAX. 2MB)</p>
                                                </div>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleQrUpload}
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/employees")}
                            className="px-8 py-6 text-base"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-6 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Adding Employee...
                                </>
                            ) : (
                                "Add Employee"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}