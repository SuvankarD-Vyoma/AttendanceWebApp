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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { getEmployeeAvailableLeaveList, getLeaveRequestsByAdmin, approvalOfEmployeeLeaveRequestByAdmin } from "./api";

interface EmployeeLeaveBalance {
    employee_id: string;
    employee_name: string;
    available_sl: number;
    available_cl: number;
    available_pl: number;
    total_leave: number;
    remaining_leave: number;
}

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
    session_type_id?: string;
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
    const [leaveBalances, setLeaveBalances] = useState<EmployeeLeaveBalance[]>([]);
    const [loadingBalances, setLoadingBalances] = useState(false);

    const fetchLeaveBalances = async () => {
        try {
            setLoadingBalances(true);
            const admin_Id = getCookie("admin_Id");
            if (!admin_Id) return;
            const decodedadmin_Id = decodeURIComponent(admin_Id as string);
            const result = await getEmployeeAvailableLeaveList(decodedadmin_Id);
            if (result && result.data) {
                setLeaveBalances(result.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingBalances(false);
        }
    };

    useEffect(() => {
        fetchLeaveBalances();
    }, []);

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

            const admin_Id = getCookie("admin_Id");
            if (!admin_Id) throw new Error("User ID not found in cookies");

            const decodedadmin_Id = decodeURIComponent(admin_Id as string);

            const result = await getLeaveRequestsByAdmin(decodedadmin_Id);

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
                leave_status_id: item.leave_status_id != null ? Number(item.leave_status_id) : 1,
                session_type_id: item.session_type_id || '',
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
            session_type_id: leaveRequestObj?.session_type_id || '',
        };

        try {
            const responseData = await approvalOfEmployeeLeaveRequestByAdmin(payload);
            toast.success(responseData?.message || "Leave status updated successfully");
            fetchLeaveRequests();
        } catch (err: any) {
            toast.error(err.message || "Failed to update leave status.");
        }

        setShowRejectRemark(null);
        setRejectRemark("");
        setRejectRemarkError("");
    }, [leaveRequests]);

    // ✅ Modal for mandatory reject remark
    const renderRejectModal = () => (
        <Dialog open={!!showRejectRemark} onOpenChange={(open) => !open && setShowRejectRemark(null)}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Reject Leave Request</DialogTitle>
                    <DialogDescription>
                        Please provide a reason for rejecting this leave request. This will be shared with the employee.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className={rejectRemarkError ? "text-red-500 font-medium" : "text-muted-foreground"}>
                                {rejectRemarkError || "Reason required"}
                            </span>
                            <span className={wordCount(rejectRemark) > 20 ? "text-red-500" : "text-muted-foreground"}>
                                {wordCount(rejectRemark)}/20 words
                            </span>
                        </div>
                        <Textarea
                            placeholder="Type your reason here..."
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
                            className={rejectRemarkError ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowRejectRemark(null)}>Cancel</Button>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            if (!rejectRemark.trim()) {
                                setRejectRemarkError("Remark is required");
                                return;
                            }
                            if (wordCount(rejectRemark) > 20) {
                                setRejectRemarkError("Remark cannot exceed 20 words");
                                return;
                            }
                            if (showRejectRemark) {
                                handleAction(
                                    showRejectRemark.employeeId,
                                    "reject",
                                    showRejectRemark.leaveRequestId,
                                    rejectRemark.trim()
                                );
                            }
                        }}
                    >
                        Confirm Rejection
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
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
            <div className="p-6 space-y-6 bg-slate-50/50 dark:bg-black min-h-screen">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <Skeleton className="h-10 w-[300px]" />
                    <Skeleton className="h-10 w-[250px]" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-[125px] w-full rounded-xl" />
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                </div>
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-black dark:to-zinc-900 p-6 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Leave Management</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage employee leave requests and view balances.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
                            <Input
                                type="text"
                                placeholder="Search employee..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                                className="pl-9 w-full md:w-[300px] bg-white/80 dark:bg-zinc-900/80 border-slate-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="requests" className="w-full space-y-6">
                    <TabsList className="grid w-full md:w-[400px] grid-cols-2 bg-slate-200/50 dark:bg-zinc-800/50 p-1 rounded-xl">
                        <TabsTrigger value="requests" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all">Leave Requests</TabsTrigger>
                        <TabsTrigger value="balances" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all">Leave Balances</TabsTrigger>
                    </TabsList>

                    <TabsContent value="requests" className="space-y-4">
                        <Card className="border-none shadow-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl ring-1 ring-slate-200 dark:ring-zinc-800">
                            <CardHeader className="border-b border-slate-100 dark:border-zinc-800/50 pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        Request List
                                    </CardTitle>
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-slate-200 px-3 py-1 rounded-full">
                                        {filteredAndSortedRequests.length} Total
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-slate-50/80 dark:bg-zinc-900/50">
                                            <TableRow className="border-b border-slate-100 dark:border-zinc-800 hover:bg-transparent">
                                                <TableHead className="text-center font-semibold text-slate-600 dark:text-slate-400">
                                                    <Button variant="ghost" onClick={() => handleSort('employee_name')} className="hover:bg-transparent hover:text-blue-600 p-0 font-semibold flex items-center justify-center gap-1 mx-auto">
                                                        Employee <ArrowUpDown className="h-3 w-3" />
                                                    </Button>
                                                </TableHead>
                                                <TableHead className="text-center font-semibold text-slate-600 dark:text-slate-400">Type</TableHead>
                                                <TableHead className="text-center font-semibold text-slate-600 dark:text-slate-400">Duration</TableHead>
                                                <TableHead className="text-center font-semibold text-slate-600 dark:text-slate-400">Days</TableHead>
                                                <TableHead className="text-center font-semibold text-slate-600 dark:text-slate-400">Reason</TableHead>
                                                <TableHead className="text-center font-semibold text-slate-600 dark:text-slate-400">Status</TableHead>
                                                <TableHead className="text-center font-semibold text-slate-600 dark:text-slate-400">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>

                                        <TableBody>
                                            {currentItems.length > 0 ? currentItems.map((req) => (
                                                <TableRow key={req.leave_request_id || req.employee_id} className="border-b border-slate-50 dark:border-zinc-800/50 hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                                                    <TableCell className="text-center py-4">
                                                        <div className="flex items-center gap-3 justify-center">
                                                            <Avatar className="h-9 w-9 border-2 border-white dark:border-zinc-700 shadow-sm">
                                                                <AvatarImage src="" alt={req.employee_name} />
                                                                <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 font-medium text-xs">
                                                                    {req.employee_name.slice(0, 2).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="text-left">
                                                                <div className="font-medium text-sm text-slate-900 dark:text-slate-100">{req.employee_name}</div>
                                                                <div className="text-[11px] text-slate-500 dark:text-slate-400">Applied: {req.applied_date}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="outline" className="font-normal bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-700">
                                                            {req.leave_type_name}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex flex-col items-center text-sm">
                                                            <span className="font-medium text-slate-700 dark:text-slate-300">{formatFriendlyDate(req.leave_start_date)}</span>
                                                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">to</span>
                                                            <span className="font-medium text-slate-700 dark:text-slate-300">{formatFriendlyDate(req.leave_end_date)}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className="font-semibold text-slate-700 dark:text-slate-300">{duration(req.leave_start_date, req.leave_end_date)}</span>
                                                        <span className="text-xs text-slate-500 ml-1">days</span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <div className="max-w-[180px] mx-auto truncate text-sm text-slate-600 dark:text-slate-400 cursor-help border-b border-dotted border-slate-300 dark:border-zinc-700 inline-block">
                                                                        {req.reason_of_leave}
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent className="max-w-[300px] p-3 bg-slate-800 text-white border-none shadow-xl">
                                                                    <p className="text-xs leading-relaxed">{req.reason_of_leave}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="outline" className={`capitalize ${getStatusBadgeVariant(req.status)} px-2.5 py-0.5 text-xs font-semibold shadow-sm border-0 ring-1 ring-inset ring-opacity-20`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full mr-2 ${getStatusDotColor(req.status)}`}></div>
                                                            {req.status.toLowerCase()}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex justify-center gap-2">
                                                            {req.status.toLowerCase() === 'pending' ? (
                                                                <>
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <Button
                                                                                    size="sm"
                                                                                    className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 border border-emerald-200 shadow-sm transition-all"
                                                                                    onClick={() => handleAction(req.employee_id, 'approve', req.leave_request_id)}
                                                                                >
                                                                                    <Check className="h-4 w-4" />
                                                                                </Button>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>Approve Request</TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <Button
                                                                                    size="sm"
                                                                                    className="h-8 w-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200 shadow-sm transition-all"
                                                                                    onClick={() => setShowRejectRemark({ employeeId: req.employee_id, leaveRequestId: req.leave_request_id })}
                                                                                >
                                                                                    <X className="h-4 w-4" />
                                                                                </Button>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>Reject Request</TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                </>
                                                            ) : (
                                                                <span className="text-xs text-slate-400 italic font-medium">Completed</span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )) : (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center h-48">
                                                        <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                                                            <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                                                                <User className="h-6 w-6" />
                                                            </div>
                                                            <span className="font-medium">No Leave Requests Found</span>
                                                            <p className="text-xs text-slate-400 max-w-[200px]">Try adjusting your search or check back later.</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex justify-between items-center p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-900/30">
                                        <div className="text-xs text-slate-500 font-medium">Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredAndSortedRequests.length)} of {filteredAndSortedRequests.length}</div>
                                        <Pagination>
                                            <PaginationContent>
                                                <PaginationItem>
                                                    <PaginationPrevious
                                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                        className={`cursor-pointer transition-all ${currentPage === 1 ? 'opacity-50 pointer-events-none' : 'hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
                                                    />
                                                </PaginationItem>
                                                <PaginationItem>
                                                    <span className="px-4 text-sm font-medium text-slate-700 dark:text-slate-300">Page {currentPage} of {totalPages}</span>
                                                </PaginationItem>
                                                <PaginationItem>
                                                    <PaginationNext
                                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                        className={`cursor-pointer transition-all ${currentPage === totalPages ? 'opacity-50 pointer-events-none' : 'hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
                                                    />
                                                </PaginationItem>
                                            </PaginationContent>
                                        </Pagination>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="balances" className="space-y-4">
                        <Card className="border-none shadow-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl ring-1 ring-slate-200 dark:ring-zinc-800">
                            <CardHeader className="border-b border-slate-100 dark:border-zinc-800/50 pb-4">
                                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                        <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    Employee Leave Balances
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-slate-50/80 dark:bg-zinc-900/50">
                                            <TableRow className="border-b border-slate-100 dark:border-zinc-800 hover:bg-transparent">
                                                <TableHead className="font-semibold text-slate-600 dark:text-slate-400 pl-6">Employee Name</TableHead>
                                                <TableHead className="text-center font-semibold text-slate-600 dark:text-slate-400">SL</TableHead>
                                                <TableHead className="text-center font-semibold text-slate-600 dark:text-slate-400">CL</TableHead>
                                                <TableHead className="text-center font-semibold text-slate-600 dark:text-slate-400">PL</TableHead>
                                                <TableHead className="text-center font-semibold text-slate-600 dark:text-slate-400">Total</TableHead>
                                                <TableHead className="text-center font-semibold text-slate-600 dark:text-slate-400">Remaining</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loadingBalances ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center h-32">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Skeleton className="h-8 w-8 rounded-full" />
                                                            <span className="text-sm text-slate-500">Loading balances...</span>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : leaveBalances.filter(emp => emp.employee_name.toLowerCase().includes(search.toLowerCase())).length > 0 ? (
                                                leaveBalances
                                                    .filter(emp => emp.employee_name.toLowerCase().includes(search.toLowerCase()))
                                                    .map((emp) => (
                                                        <TableRow key={emp.employee_id} className="border-b border-slate-50 dark:border-zinc-800/50 hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                                                            <TableCell className="font-medium pl-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <Avatar className="h-8 w-8 border border-slate-200 dark:border-zinc-700">
                                                                        <AvatarFallback className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200 text-xs">
                                                                            {emp.employee_name.slice(0, 2).toUpperCase()}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    {emp.employee_name}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-center text-slate-600 dark:text-slate-400">{emp.available_sl}</TableCell>
                                                            <TableCell className="text-center text-slate-600 dark:text-slate-400">{emp.available_cl}</TableCell>
                                                            <TableCell className="text-center text-slate-600 dark:text-slate-400">{emp.available_pl}</TableCell>
                                                            <TableCell className="text-center font-bold text-slate-800 dark:text-slate-200">{emp.total_leave}</TableCell>
                                                            <TableCell className="text-center">
                                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50">
                                                                    {emp.remaining_leave}
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center h-32 text-slate-500">
                                                        No balances found
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
            {renderRejectModal()}
        </div>
    );
}