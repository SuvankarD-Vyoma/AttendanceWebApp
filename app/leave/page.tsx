"use client";

import React, { useState, useEffect, useMemo } from 'react';
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

// Import shadcn components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// API (assuming the path is correct)
import { getLeaveRequestsByAdmin } from './api';
import { AvatarImage } from '@radix-ui/react-avatar';

interface LeaveRequest {
    employee_id: string;
    employee_name: string;
    leave_type_name: string;
    leave_start_date: string; // "DD-MM-YYYY"
    leave_end_date: string;   // "DD-MM-YYYY"
    reason_of_leave: string;
    status: string;
    days: number;
    applied_date: string;   // "DD-MM-YYYY"
}

export default function LeaveManagementPage() {
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [currentPage, setCurrentPage] = useState(1);
    const [sortColumn, setSortColumn] = useState<keyof LeaveRequest>('applied_date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchLeaveRequests = async () => {
            try {
                setLoading(true);
                setError(null);

                const userId = getCookie("userId");
                if (!userId) {
                    throw new Error('User ID not found in cookies.');
                }
                const decodedUserId = decodeURIComponent(userId as string);

                const response = await getLeaveRequestsByAdmin(decodedUserId);
                if (response && response.data) {
                    const leaveData = response.data.map((item: any) => ({
                        ...item,
                        status: item.status ?? 'pending'
                    }));
                    setLeaveRequests(leaveData);
                } else {
                    setLeaveRequests([]);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaveRequests();
    }, []);

    const handleAction = async (employeeId: string, action: 'approve' | 'reject') => {
        setLeaveRequests(prev =>
            prev.map(request =>
                request.employee_id === employeeId
                    ? { ...request, status: action === 'approve' ? 'Approved' : 'Rejected' }
                    : request
            )
        );
    };

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
        if (parts[0] > 1000) {
            const [year, month, day] = parts;
            return new Date(year, month - 1, day);
        } else {
            const [day, month, year] = parts;
            return new Date(year, month - 1, day);
        }
    };

    const filteredAndSortedRequests = useMemo(() => {
        return leaveRequests
            .filter(request => {
                const name = request.employee_name || "";
                return name.toLowerCase().includes(search.toLowerCase());
            })
            .sort((a, b) => {
                const aValue = a[sortColumn];
                const bValue = b[sortColumn];

                if (aValue === null || aValue === undefined) return 1;
                if (bValue === null || bValue === undefined) return -1;

                let comparison = 0;
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    if (sortColumn === 'leave_start_date' || sortColumn === 'applied_date') {
                        comparison = parseApiDate(aValue).getTime() - parseApiDate(bValue).getTime();
                    } else {
                        comparison = aValue.localeCompare(bValue);
                    }
                } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                    comparison = aValue - bValue;
                }

                return sortDirection === 'asc' ? comparison : -comparison;
            });
    }, [leaveRequests, search, sortColumn, sortDirection]);

    const totalPages = Math.ceil(filteredAndSortedRequests.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredAndSortedRequests.slice(startIndex, endIndex);

    const duration = (start: string, end: string): number => {
        const startDate = parseApiDate(start);
        const endDate = parseApiDate(end);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/50';
            case 'rejected':
                return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800/50';
            case 'pending':
                return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/50';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700/50';
        }
    };

    const getStatusDotColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'bg-emerald-500';
            case 'rejected': return 'bg-red-500';
            case 'pending': return 'bg-amber-500';
            default: return 'bg-slate-500';
        }
    }

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
                <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 bg-slate-50 dark:bg-black min-h-screen">

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-end pt-6 gap-4 m-4">
                <div className="flex items-end gap-2">
                    <Input
                        id="search"
                        type="text"
                        placeholder="Search employee..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                        className="w-full md:w-80 bg-white dark:bg-slate-900 dark:text-slate-100 border-slate-200 dark:border-zinc-800"
                    />
                </div>
            </div>

            {/* Table */}
            <Card className="border-slate-200/80 shadow-lg m-4 bg-white/50 dark:bg-slate-900/70 dark:border-zinc-800 backdrop-blur-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                        <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Leave Requests
                        <Badge variant="secondary" className="ml-2 bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-slate-200 dark:border-zinc-700">{filteredAndSortedRequests.length} records</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-100 dark:bg-black">
                                <TableRow className="border-b-slate-200 dark:border-b-zinc-800">
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleSort('employee_name')} className="px-0 text-slate-800 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                                            Employee <ArrowUpDown className="ml-1 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleSort('leave_type_name')} className="px-0 text-slate-800 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                                            Type <ArrowUpDown className="ml-1 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead className="text-slate-800 dark:text-slate-300">Duration</TableHead>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleSort('days')} className="px-0 text-slate-800 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                                            Days <ArrowUpDown className="ml-1 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead className="text-slate-800 dark:text-slate-300">Reason</TableHead>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleSort('status')} className="px-0 text-slate-800 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                                            Status <ArrowUpDown className="ml-1 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead className="text-right text-slate-800 dark:text-slate-300">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentItems.length > 0 ? (
                                    currentItems.map((request) => (
                                        <TableRow
                                            key={request.employee_id}
                                            className="border-b border-slate-200/80 dark:border-zinc-800 hover:bg-slate-100/50 dark:hover:bg-zinc-800/50 transition-colors"
                                        >
                                            <TableCell className="py-3">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-700 shadow-md">
                                                        <AvatarImage src={""} alt={request.employee_name || "Employee"} />
                                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
                                                            {(request.employee_name ?? "NA").split(' ').filter(w => w).map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium text-slate-800 dark:text-slate-100 text-sm">{request.employee_name}</div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">Applied: {request.applied_date}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-700 dark:text-slate-300">{request.leave_type_name}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="text-sm text-slate-700 dark:text-slate-300">{formatFriendlyDate(request.leave_start_date)}</p>
                                                    <p className='text-xs text-slate-500 dark:text-slate-500'>to</p>
                                                    <p className="text-sm text-slate-700 dark:text-slate-300">{formatFriendlyDate(request.leave_end_date)}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-700 dark:text-slate-300">{duration(request.leave_start_date, request.leave_end_date)} days</TableCell>
                                            <TableCell>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <p className="max-w-[120px] truncate text-xs text-slate-600 dark:text-slate-400">{request.reason_of_leave}</p>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-zinc-800">
                                                            <p>{request.reason_of_leave}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`capitalize ${getStatusBadgeVariant(request.status)} text-xs`}>
                                                    <div className={`w-2 h-2 rounded-full mr-1.5 ${getStatusDotColor(request.status)}`}></div>
                                                    {request.status.toLowerCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <TooltipProvider>
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600 dark:text-green-500 hover:bg-green-100 dark:hover:bg-green-950/80 hover:text-green-700 dark:hover:text-green-400" onClick={() => handleAction(request.employee_id, 'approve')}>
                                                                    <Check className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-zinc-800"><p>Approve</p></TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-950/80 hover:text-red-700 dark:hover:text-red-400" onClick={() => handleAction(request.employee_id, 'reject')}>
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-zinc-800"><p>Reject</p></TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </TooltipProvider>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow className="border-b-0">
                                        <TableCell
                                            colSpan={7}
                                            className="h-32 text-center text-slate-500 dark:text-slate-500"
                                        >
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <User className="h-10 w-10 text-slate-400 dark:text-slate-600" />
                                                <span className="text-base font-medium">No Leave Requests Found</span>
                                                <span className="text-xs">Try adjusting your search or date range.</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center p-3 border-t border-slate-200/60 dark:border-zinc-800 bg-slate-50/60 dark:bg-slate-900/80">
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                                Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedRequests.length)} of {filteredAndSortedRequests.length} entries
                            </div>
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''} />
                                    </PaginationItem>
                                    <PaginationItem>
                                        <span className="px-3 py-1 text-xs text-slate-700 dark:text-slate-300">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationNext onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}