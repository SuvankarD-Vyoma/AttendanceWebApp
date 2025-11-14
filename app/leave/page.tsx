"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getCookie } from "cookies-next";
import { format } from 'date-fns';
import * as XLSX from "xlsx";
import {
    Search,
    Calendar,
    Download,
    Check,
    X,
    User,
    Filter,
    ArrowUpDown
} from 'lucide-react';
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface LeaveRequest {
    employee_id: string;
    employee_name: string;
    leave_type_name: string;
    leave_type_id?: number;
    leave_start_date: string;
    leave_end_date: string;
    reason_of_leave: string;
    status: string;
    days: number;
    applied_date: string;
    leave_request_id?: string | number;
    admin_id?: string;
    leave_status_id?: number;
}

export default function LeaveManagementPage() {
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortColumn, setSortColumn] = useState<keyof LeaveRequest>('applied_date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const itemsPerPage = 10;

    const [showRejectRemark, setShowRejectRemark] = useState<null | { employeeId: string, leaveRequestId?: string | number }>(null);
    const [rejectRemark, setRejectRemark] = useState<string>("");
    const [rejectRemarkError, setRejectRemarkError] = useState<string>("");

    const wordCount = (str: string) => (str.trim() ? str.trim().split(/\s+/).length : 0);

    const getStatusStringFromId = (id: string | number): string => {
        const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
        switch (numericId) {
            case 1: return 'Pending';
            case 2: return 'Approved';
            case 3: return 'Rejected';
            default: return 'Unknown';
        }
    };

    const fetchLeaveRequests = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = getCookie("token") || "";
            const admin_Id = getCookie("admin_Id");
            if (!admin_Id) throw new Error("User ID not found in cookies");

            const decodedadmin_Id = decodeURIComponent(admin_Id as string);

            const myHeaders = new Headers();
            myHeaders.append("accept", "*/*");
            myHeaders.append("Content-Type", "application/json");
            myHeaders.append("Authorization", `Bearer ${token}`);

            const raw = JSON.stringify({ admin_id: decodedadmin_Id });

            const response = await fetch(
                "http://wbassetmgmtservice.link/VYOMAUMSRestAPI/api/admin/getLeaveRequestsByAdmin",
                { method: "POST", headers: myHeaders, body: raw }
            );

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const resultText = await response.text();
            const result = JSON.parse(resultText);

            let leaveList: any[] = [];
            if (Array.isArray(result)) leaveList = result;
            else if (Array.isArray(result.data)) leaveList = result.data;
            else if (Array.isArray(result?.data?.leave_requests)) leaveList = result.data.leave_requests;

            const leaveData = leaveList.map((item: any) => ({
                admin_id: item.admin_id || '',
                employee_id: item.employee_id || '',
                employee_name: item.employee_name || 'Unknown',
                leave_type_name: item.leave_type_name || '',
                leave_type_id: item.leave_type_id != null ? Number(item.leave_type_id) : 0,
                leave_start_date: item.leave_start_date || '',
                leave_end_date: item.leave_end_date || '',
                reason_of_leave: item.reason_of_leave || '',
                status: getStatusStringFromId(item.leave_status_id || '1'),
                days: item.days || 0,
                applied_date: item.applied_date || '',
                leave_request_id: item.leave_request_id ?? item.id,
                leave_status_id: item.leave_status_id != null ? Number(item.leave_status_id) : 1
            }));

            setLeaveRequests(leaveData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaveRequests();
    }, []);

    // FIXED handleAction — no more "API failed: {}"
    const handleAction = useCallback(async (
        employeeId: string,
        action: 'approve' | 'reject',
        leaveRequestId?: string | number,
        rejectReason?: string
    ) => {

        if (action === "reject" && !rejectReason) {
            setShowRejectRemark({ employeeId, leaveRequestId });
            return;
        }

        if (action === "reject") {
            if (!rejectReason?.trim()) {
                setRejectRemarkError("Remark is required");
                return;
            }
            if (wordCount(rejectReason) > 20) {
                setRejectRemarkError("Remark cannot exceed 20 words");
                return;
            }
        }

        let admin_id = String(getCookie("admin_Id") || "");
        const leaveRequestObj = leaveRequests.find(
            (lr) => lr.employee_id === employeeId && (leaveRequestId ? lr.leave_request_id == leaveRequestId : true)
        );

        const leave_type_id = leaveRequestObj?.leave_type_id || 0;

        const toDDMMYYYY = (dateStr: string) => {
            const d = new Date(dateStr);
            return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
        };

        const payload = {
            admin_id,
            employee_id: employeeId,
            leave_type_id,
            approval_status: action === "approve" ? 2 : 3,
            leave_request_id: leaveRequestId,
            leave_start_date: toDDMMYYYY(leaveRequestObj?.leave_start_date || ""),
            leave_end_date: toDDMMYYYY(leaveRequestObj?.leave_end_date || ""),
            reject_reason: action === "reject" ? rejectReason : "",
        };

        let bearerToken = getCookie("access_token") || getCookie("token") || "";

        const myHeaders = new Headers();
        myHeaders.append("accept", "*/*");
        myHeaders.append("Content-Type", "application/json");
        if (bearerToken) myHeaders.append("Authorization", `Bearer ${bearerToken}`);

        try {
            const response = await fetch(
                "https://wbassetmgmtservice.link/VYOMAUMSRestAPI/api/admin/approvalOfEmployeeLeaveRequestByAdmin",
                { method: "POST", headers: myHeaders, body: JSON.stringify(payload) }
            );

            let responseData: any = null;
            try {
                responseData = await response.json();
            } catch (e) {
                responseData = {};
            }

            // FIX — do NOT treat {} as failure
            if (response.ok) {
                toast.success(responseData?.message || "Leave status updated successfully");
                fetchLeaveRequests();
            } else {
                toast.error(responseData?.message || "Failed to update leave status.");
            }

        } catch (err) {
            toast.error("Unexpected error occurred");
        }

        setShowRejectRemark(null);
        setRejectRemark("");
        setRejectRemarkError("");
    }, [leaveRequests]);
    // --- End Fix ---

    // ✅ Modal for mandatory reject remark
    const renderRejectModal = () =>
        showRejectRemark && (
            <div
                style={{
                    position: "fixed",
                    zIndex: 9999,
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    background: "rgba(0,0,0,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <div
                    style={{
                        background: "#fff",
                        borderRadius: 8,
                        boxShadow: "0 2px 18px 0 rgba(0,0,0,.3)",
                        padding: 24,
                        minWidth: 350,
                        maxWidth: 420,
                        width: "100%",
                    }}
                >
                    <div style={{ marginBottom: 18, fontWeight: 700, fontSize: 20 }}>
                        Enter Rejection Remark{" "}
                        <span
                            style={{
                                fontWeight: 400,
                                fontSize: 14,
                                color: "#888",
                            }}
                        >
                            (max 20 words, required)
                        </span>
                    </div>
                    <textarea
                        rows={3}
                        style={{
                            width: "100%",
                            padding: 8,
                            borderColor: rejectRemarkError ? "red" : "#bbb",
                            borderWidth: 1,
                            borderRadius: 5,
                            fontSize: 15,
                            marginBottom: 4,
                            resize: "none",
                        }}
                        placeholder="Type reason (max 20 words, required)..."
                        value={rejectRemark}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (wordCount(val) > 20) {
                                setRejectRemarkError("Remark cannot exceed 20 words");
                                setRejectRemark(val.split(/\s+/).slice(0, 20).join(" "));
                            } else if (!val.trim()) {
                                setRejectRemark(val);
                                setRejectRemarkError("Remark is required");
                            } else {
                                setRejectRemark(val);
                                setRejectRemarkError("");
                            }
                        }}
                    />
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <span
                            style={{
                                fontSize: 12,
                                color: rejectRemarkError ? "red" : "#888",
                                marginRight: 6,
                            }}
                        >
                            {rejectRemarkError ||
                                `Words: ${wordCount(rejectRemark)}/20`}
                        </span>
                        <div>
                            <button
                                onClick={() => {
                                    setShowRejectRemark(null);
                                    setRejectRemark("");
                                    setRejectRemarkError("");
                                }}
                                style={{
                                    background: "#eee",
                                    color: "#333",
                                    border: "none",
                                    borderRadius: 5,
                                    padding: "5px 16px",
                                    marginRight: 8,
                                    cursor: "pointer",
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (!rejectRemark.trim()) {
                                        setRejectRemarkError("Remark is required");
                                        return;
                                    }
                                    if (wordCount(rejectRemark) > 20) {
                                        setRejectRemarkError("Remark cannot exceed 20 words");
                                        return;
                                    }
                                    handleAction(
                                        showRejectRemark.employeeId,
                                        "reject",
                                        showRejectRemark.leaveRequestId,
                                        rejectRemark.trim()
                                    );
                                }}
                                style={{
                                    background: "#e14949",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 5,
                                    padding: "5px 18px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );


    const handleSort = (column: keyof LeaveRequest) => {
        if (sortColumn === column) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    const parseApiDate = (dateStr: string): Date => {
        const parts = dateStr.split('-').map(Number);
        if (parts[0] > 1000) { // Assuming YYYY-MM-DD
            const [year, month, day] = parts;
            return new Date(year, month - 1, day);
        } else { // Assuming DD-MM-YYYY
            const [day, month, year] = parts;
            return new Date(year, month - 1, day);
        }
    };

    const filteredAndSortedRequests = useMemo(() => {
        return leaveRequests
            .filter(req => req.employee_name.toLowerCase().includes(search.toLowerCase()))
            .sort((a, b) => {
                const aVal = a[sortColumn];
                const bVal = b[sortColumn];
                if (aVal == null) return 1;
                if (bVal == null) return -1;
                let comp = 0;
                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    if (sortColumn === 'leave_start_date' || sortColumn === 'applied_date')
                        comp = parseApiDate(aVal).getTime() - parseApiDate(bVal).getTime();
                    else comp = aVal.localeCompare(bVal);
                } else if (typeof aVal === 'number' && typeof bVal === 'number') comp = aVal - bVal;
                return sortDirection === 'asc' ? comp : -comp;
            });
    }, [leaveRequests, search, sortColumn, sortDirection]);

    const totalPages = Math.ceil(filteredAndSortedRequests.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredAndSortedRequests.slice(startIndex, startIndex + itemsPerPage);

    const duration = (start: string, end: string): number => {
        const s = parseApiDate(start);
        const e = parseApiDate(end);
        const diff = Math.abs(e.getTime() - s.getTime());
        return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
            case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    const getStatusDotColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'bg-emerald-500';
            case 'rejected': return 'bg-red-500';
            case 'pending': return 'bg-amber-500';
            default: return 'bg-slate-500';
        }
    };

    const formatFriendlyDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = parseApiDate(dateStr);
        return format(date, 'do MMMM');
    };

    if (loading) {
        return (
            <div className="p-6 h-screen flex justify-center items-center bg-slate-50 dark:bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-slate-100"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 h-screen flex flex-col justify-center items-center text-center bg-slate-50 dark:bg-black">
                <p className="text-red-600 dark:text-red-400 text-lg">Error: {error}</p>
                <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">Retry</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 bg-slate-50 dark:bg-black min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end md:justify-end pt-6 gap-4 m-4">
                <Input
                    type="text"
                    placeholder="Search employee..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    className="w-full md:w-80 bg-white dark:bg-slate-900 dark:text-slate-100 border-slate-200 dark:border-zinc-800"
                />
            </div>

            <Card className="border-slate-200/80 shadow-lg m-4 bg-white/50 dark:bg-slate-900/70 dark:border-zinc-800 backdrop-blur-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                        <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Leave Requests
                        <Badge variant="secondary" className="ml-2 bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-slate-200 dark:border-zinc-700">
                            {filteredAndSortedRequests.length} records
                        </Badge>
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-100 dark:bg-black">
                                <TableRow className="border-b-slate-200 dark:border-b-zinc-800">
                                    <TableHead className="text-center">
                                        <Button variant="ghost" onClick={() => handleSort('employee_name')} className="px-0 text-slate-800 dark:text-slate-300 mx-auto flex items-center justify-center">
                                            Employee <ArrowUpDown className="ml-1 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead className="text-center">Type</TableHead>
                                    <TableHead className="text-center">Duration</TableHead>
                                    <TableHead className="text-center">Days</TableHead>
                                    <TableHead className="text-center">Reason</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {currentItems.length > 0 ? currentItems.map((req) => (
                                    <TableRow key={req.leave_request_id || req.employee_id} className="border-b border-slate-200/80 dark:border-zinc-800 hover:bg-slate-100/50">
                                        <TableCell className="text-center">
                                            <div className="flex items-center gap-3 justify-center">
                                                <Avatar className="h-10 w-10 border-2 border-white">
                                                    <AvatarImage src="" alt={req.employee_name} />
                                                    <AvatarFallback>{req.employee_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div className="text-left">
                                                    <div className="font-medium">{req.employee_name}</div>
                                                    <div className="text-xs text-slate-500">Applied: {req.applied_date}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">{req.leave_type_name}</TableCell>
                                        <TableCell className="text-center">
                                            <p>{formatFriendlyDate(req.leave_start_date)}</p>
                                            <p className="text-xs text-slate-500">to</p>
                                            <p>{formatFriendlyDate(req.leave_end_date)}</p>
                                        </TableCell>
                                        <TableCell className="text-center">{duration(req.leave_start_date, req.leave_end_date)} days</TableCell>
                                        <TableCell className="text-center text-xs truncate max-w-[120px]">{req.reason_of_leave}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className={`capitalize ${getStatusBadgeVariant(req.status)} text-xs flex items-center justify-center`}>
                                                <div className={`w-2 h-2 rounded-full mr-1.5 ${getStatusDotColor(req.status)}`}></div>
                                                {req.status.toLowerCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center gap-1">
                                                {/* Only show action buttons if status is pending */}
                                                {req.status.toLowerCase() === 'pending' ? (
                                                    <>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button size="icon" variant="ghost" onClick={() => handleAction(req.employee_id, 'approve', req.leave_request_id)}>
                                                                        <Check className="h-4 w-4 text-green-600" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent className="bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900">
                                                                    Approve
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button size="icon" variant="ghost" onClick={() => handleAction(req.employee_id, 'reject', req.leave_request_id)}>
                                                                        <X className="h-4 w-4 text-red-600" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent className="bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900">
                                                                    Reject
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-slate-500 italic">{req.status}</span>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-32">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <User className="h-10 w-10 text-slate-400" />
                                                <span>No Leave Requests Found</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-between items-center p-3 border-t border-slate-200/60">
                            <div className="text-xs">Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredAndSortedRequests.length)} of {filteredAndSortedRequests.length}</div>
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} className={currentPage === 1 ? 'opacity-50 pointer-events-none' : ''} />
                                    </PaginationItem>
                                    <PaginationItem>
                                        <span className="px-3 text-xs">Page {currentPage} of {totalPages}</span>
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationNext onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} className={currentPage === totalPages ? 'opacity-50 pointer-events-none' : ''} />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </CardContent>
            </Card>

            {renderRejectModal()}
        </div>
    );
}