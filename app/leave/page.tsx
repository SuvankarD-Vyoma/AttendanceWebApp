"use client";

import React, { useState, useEffect } from 'react';
import { getCookie } from "cookies-next";
import {
    Search,
    Calendar,
    Download,
    Check,
    X,
    Clock
} from 'lucide-react';

// Import shadcn components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { getLeaveRequestsByAdmin } from './api';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface LeaveRequest {
    employee_id: string;
    employee_name: string;
    leave_type_name: string;
    leave_start_date: string;
    leave_end_date: string;
    reason_of_leave: string;
    status: string;
    days: number;
    applied_date: string;
}

export default function LeaveManagementPage() {
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchLeaveRequests = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get userId from cookies and decode it
                const userId = getCookie("userId");
                if (!userId) {
                    throw new Error('User ID not found');
                }
                const decodedUserId = decodeURIComponent(userId);

                const response = await getLeaveRequestsByAdmin(decodedUserId);
                if (response && response.data) {
                    setLeaveRequests(response.data);
                } else {
                    throw new Error('Invalid response format');
                }
            } catch (err) {
                setError(err.message);
                console.error('Error fetching leave requests:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaveRequests();
    }, []); // Empty dependency array means this runs once on mount

    const handleAction = async (employeeId, action) => {
        // TODO: Implement approve/reject API call
        setLeaveRequests(prev =>
            prev.map(request =>
                request.employee_id === employeeId
                    ? { ...request, status: action === 'approve' ? 'Approved' : 'Rejected' }
                    : request
            )
        );
    };

    const getStatusBadgeVariant = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'rejected':
                return 'bg-red-50 text-red-700 border-red-200';
            case 'pending':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    const getInitials = (name) => {
        if (!name) return '';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const filteredRequests = leaveRequests.filter(request =>
        request.employee_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredRequests.slice(startIndex, endIndex);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-slate-600">Loading leave requests...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-600">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
            <div className="p-6 space-y-6">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0 gap-4">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-700 bg-clip-text text-transparent">
                            Leave Management
                        </h1>
                        <p className="text-slate-600 text-lg">
                            Review and manage employee leave requests
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                type="search"
                                placeholder="Search by employee name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-full sm:w-80 h-11 border-slate-200/60 bg-white/70 backdrop-blur-md focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                    </div>
                </div>

                {/* Leave Requests Table */}
                <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-slate-200/50 bg-gradient-to-r from-slate-50/80 to-blue-50/60 py-4">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                    <Clock className="h-4 w-4 text-white" />
                                </div>
                                <CardTitle className="text-xl font-semibold text-slate-900">
                                    Leave Requests
                                </CardTitle>
                            </div>

                            <div className="flex-1 flex flex-wrap items-center gap-4 justify-end">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">

                                        <Input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-40 h-9 border-slate-200/60"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">

                                        <Input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-40 h-9 border-slate-200/60"
                                        />
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-200/60 hover:bg-slate-50/80 h-9"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-slate-200/30 bg-gradient-to-r from-slate-50/60 to-blue-50/40">
                                    <TableHead className="font-semibold text-slate-700 py-4 px-6">Employee</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Leave Type</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Duration</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Days</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Reason</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Status</TableHead>
                                    <TableHead className="font-semibold text-slate-700 text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentItems.map((request) => (
                                    <TableRow key={request.employee_id}
                                        className="border-b border-slate-100/60 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/20 transition-colors">
                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-10 w-10 border-2 border-white shadow-lg ring-2 ring-blue-100">
                                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm">
                                                        {getInitials(request.employee_name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-slate-900">{request.employee_name}</div>
                                                    <div className="text-sm text-slate-500">Applied: {request.applied_date}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-700">{request.leave_type_name}</TableCell>
                                        <TableCell className="text-slate-700">
                                            {request.leave_start_date} to {request.leave_end_date}
                                        </TableCell>
                                        <TableCell className="text-slate-700">{request.days} days</TableCell>
                                        <TableCell className="text-slate-700">
                                            <div className="max-w-xs truncate">{request.reason_of_leave}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${getStatusBadgeVariant(request.status)} px-2 py-1`}>
                                                {request.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="bg-green-500 hover:bg-green-600 text-white border-0 h-8 w-8 p-0"
                                                                onClick={() => handleAction(request.employee_id, 'approve')}
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Approve</p>
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-red-500 text-red-500 hover:bg-red-50 h-8 w-8 p-0"
                                                                onClick={() => handleAction(request.employee_id, 'reject')}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Reject</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-4 px-2">
                    <div className="text-sm text-slate-600">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} entries
                    </div>
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => currentPage > 1 && setCurrentPage(prev => prev - 1)}
                                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                                />
                            </PaginationItem>
                            <PaginationItem>
                                <span className="px-4 py-2">
                                    Page {currentPage} of {totalPages}
                                </span>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => currentPage < totalPages && setCurrentPage(prev => prev + 1)}
                                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
        </div>
    );
}