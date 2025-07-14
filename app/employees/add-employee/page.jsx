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
import { saveEmployee, getAllBloodGroup, getAllGender } from "./api"; // Import the function

export default function AddEmployeePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [genders, setGenders] = useState([]);
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

    const [bloodGroups, setBloodGroups] = useState([]);

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

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name, value) => {
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Get entry_user_id from cookies
            const entryUserId = getCookieValue('entry_user_id') || 0;

            await saveEmployee({
                emp_id: 0,
                org_id: 1,
                ...form,
                emp_national_identity_info: {
                    emp_identity_type_id: form.emp_identity_type_id,
                    emp_identity_no: form.emp_identity_no,
                },
                entry_user_id: entryUserId,
            });
            toast({ title: "Employee added successfully!" });
            router.push("/employees");
        } catch (err) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    // Helper function to get cookie value
    const getCookieValue = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    };

    const handleAddEmployeeButton = () => {

    };

    useEffect(() => {
        const fetchGenders = async () => {
            const response = await getAllGender();
            setGenders(response.data);
        };
        fetchGenders();
    }, []);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Add Employee</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Personal Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="emp_full_name">Full Name *</Label>
                                <Input
                                    id="emp_full_name"
                                    name="emp_full_name"
                                    value={form.emp_full_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="emp_code">Employee Code *</Label>
                                <Input
                                    id="emp_code"
                                    name="emp_code"
                                    value={form.emp_code}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="emp_personal_contact_no">Personal Contact Number *</Label>
                                <Input
                                    id="emp_personal_contact_no"
                                    name="emp_personal_contact_no"
                                    value={form.emp_personal_contact_no}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="emp_alternate_contact_no">Alternate Contact Number</Label>
                                <Input
                                    id="emp_alternate_contact_no"
                                    name="emp_alternate_contact_no"
                                    value={form.emp_alternate_contact_no}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Email Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="emp_personal_email">Personal Email *</Label>
                                <Input
                                    id="emp_personal_email"
                                    name="emp_personal_email"
                                    type="email"
                                    value={form.emp_personal_email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="emp_official_email">Official Email</Label>
                                <Input
                                    id="emp_official_email"
                                    name="emp_official_email"
                                    type="email"
                                    value={form.emp_official_email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="doj">Date of Joining</Label>
                                <Input
                                    id="doj"
                                    name="doj"
                                    type="date"
                                    value={form.doj}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <Label htmlFor="dob">Date of Birth</Label>
                                <Input
                                    id="dob"
                                    name="dob"
                                    type="date"
                                    value={form.dob}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Work Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="designation_type_id">Designation</Label>
                                <Select
                                    value={form.designation_type_id ? String(form.designation_type_id) : ""}
                                    onValueChange={value => setForm({ ...form, designation_type_id: Number(value) })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Designation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">Software Developer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="department_id">Department</Label>
                                <Select
                                    value={form.department_id ? String(form.department_id) : ""}
                                    onValueChange={value => setForm({ ...form, department_id: Number(value) })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">IT</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Personal Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="gender_id">Gender ID</Label>
                                <Select
                                    value={form.gender_id ? String(form.gender_id) : ""}
                                    onValueChange={value => setForm({ ...form, gender_id: Number(value) })}
                                >
                                    <SelectTrigger>
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
                            <div>
                                <Label htmlFor="blood_group_id">Blood Group ID</Label>
                                <Select
                                    value={form.blood_group_id ? String(form.blood_group_id) : ""}
                                    onValueChange={value => setForm({ ...form, blood_group_id: Number(value) })}
                                >
                                    <SelectTrigger>
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
                            <div>
                                <Label htmlFor="maritial_status_id">Marital Status</Label>
                                <Select
                                    value={form.maritial_status_id ? String(form.maritial_status_id) : ""}
                                    onValueChange={value => setForm({ ...form, maritial_status_id: Number(value) })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Marital Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Married</SelectItem>
                                        <SelectItem value="2">Unmarried</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Nationality */}
                        <div>
                            <Label htmlFor="nationality">Nationality</Label>
                            <Input
                                id="nationality"
                                name="nationality"
                                value={form.nationality}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Address Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="emp_current_address">Current Address</Label>
                                <Textarea
                                    id="emp_current_address"
                                    name="emp_current_address"
                                    value={form.emp_current_address}
                                    onChange={handleChange}
                                    rows={3}
                                />
                            </div>
                            <div>
                                <Label htmlFor="emp_prmnt_address">Permanent Address</Label>
                                <Textarea
                                    id="emp_prmnt_address"
                                    name="emp_prmnt_address"
                                    value={form.emp_prmnt_address}
                                    onChange={handleChange}
                                    rows={3}
                                />
                            </div>
                        </div>

                        {/* Postal Codes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="emp_current_address_postal_code">Current Address Postal Code</Label>
                                <Input
                                    id="emp_current_address_postal_code"
                                    name="emp_current_address_postal_code"
                                    value={form.emp_current_address_postal_code}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <Label htmlFor="emp_prmnt_postal_code">Permanent Address Postal Code</Label>
                                <Input
                                    id="emp_prmnt_postal_code"
                                    name="emp_prmnt_postal_code"
                                    value={form.emp_prmnt_postal_code}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="emp_emrgncy_contact_name">Emergency Contact Name</Label>
                                <Input
                                    id="emp_emrgncy_contact_name"
                                    name="emp_emrgncy_contact_name"
                                    value={form.emp_emrgncy_contact_name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <Label htmlFor="emp_emrgncy_contact_no">Emergency Contact Number</Label>
                                <Input
                                    id="emp_emrgncy_contact_no"
                                    name="emp_emrgncy_contact_no"
                                    value={form.emp_emrgncy_contact_no}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* National Identity Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="emp_identity_type_id">Identity Type ID</Label>
                                <Input
                                    id="emp_identity_type_id"
                                    name="emp_identity_type_id"
                                    value={form.emp_identity_type_id}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <Label htmlFor="emp_identity_no">Identity Number</Label>
                                <Input
                                    id="emp_identity_no"
                                    name="emp_identity_no"
                                    value={form.emp_identity_no}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Image and QR Code */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="emp_img">Employee Image</Label>
                                <Input
                                    id="emp_img"
                                    name="emp_img"
                                    value={form.emp_img}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <Label htmlFor="emp_qr">Employee QR Code</Label>
                                <Input
                                    id="emp_qr"
                                    name="emp_qr"
                                    value={form.emp_qr}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <Button onClick={handleAddEmployeeButton} type="submit" disabled={loading} className="w-full">
                            {loading ? "Adding..." : "Add Employee"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}