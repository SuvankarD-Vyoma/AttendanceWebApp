'use client';

import { useState } from 'react';

export default function PrivacyPolicy() {
    const [activeSection, setActiveSection] = useState('');

    const sections = [
        { id: 'information', title: '1. Information We Collect' },
        { id: 'usage', title: '2. How We Use Information' },
        { id: 'permissions', title: '3. Permissions We Use' },
        { id: 'sharing', title: '4. Data Sharing' },
        { id: 'security', title: '5. Data Security' },
        { id: 'retention', title: '6. Data Retention' },
        { id: 'rights', title: '7. Your Rights' },
        { id: 'children', title: '8. Children\'s Privacy' },
        { id: 'third-party', title: '9. Third-Party Services' },
        { id: 'changes', title: '10. Changes to This Privacy Policy' },
        { id: 'contact', title: '11. Contact Us' },
    ];

    return (
        <>

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
                {/* Header */}
                <header className="bg-white shadow-sm sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-blue-900">Vyoma Attendance</h1>
                            <a
                                href="https://www.vyomainnovusglobal.com/"
                                target="_blank"
                                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                Contact Us
                            </a>
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                        {/* Sidebar Navigation - Desktop */}
                        <aside className="hidden lg:block lg:col-span-3">
                            <nav className="sticky top-24 bg-white rounded-lg shadow-md p-4">
                                <h2 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
                                    Table of Contents
                                </h2>
                                <ul className="space-y-2">
                                    {sections.map((section) => (
                                        <li key={section.id}>
                                            <a
                                                href={`#${section.id}`}
                                                onClick={() => setActiveSection(section.id)}
                                                className={`block text-sm py-2 px-3 rounded-md transition-colors ${activeSection === section.id
                                                        ? 'bg-blue-100 text-blue-900 font-medium'
                                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                    }`}
                                            >
                                                {section.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </aside>

                        {/* Main Content */}
                        <main className="lg:col-span-9">
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                                {/* Hero Section */}
                                <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 sm:px-8 py-12 text-center">
                                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                                        Privacy Policy
                                    </h1>
                                    <p className="text-xl text-blue-100 mb-2">Vyoma Attendance App</p>
                                    <p className="text-sm text-blue-200 italic">Last Updated: February 2026</p>
                                </div>

                                {/* Introduction */}
                                <div className="px-6 sm:px-8 py-8 bg-blue-50 border-l-4 border-blue-600">
                                    <p className="text-gray-700 leading-relaxed">
                                        Vyoma Attendance App respects your privacy and is committed to protecting your
                                        personal data. This Privacy Policy explains how we collect, use, and safeguard
                                        your information when you use our application.
                                    </p>
                                </div>

                                {/* Content Sections */}
                                <div className="px-6 sm:px-8 py-8 space-y-12">
                                    {/* Section 1 */}
                                    <section id="information">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
                                            1. Information We Collect
                                        </h2>
                                        <p className="text-gray-700 mb-4 leading-relaxed">
                                            We collect the following types of information to provide and improve our
                                            attendance management services:
                                        </p>
                                        <ul className="space-y-3">
                                            <li className="flex items-start">
                                                <span className="text-blue-600 font-bold mr-3 text-lg">•</span>
                                                <div>
                                                    <strong className="text-gray-900">Personal Information:</strong>
                                                    <span className="text-gray-700"> Name, employee ID, phone number, email address.</span>
                                                </div>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-blue-600 font-bold mr-3 text-lg">•</span>
                                                <div>
                                                    <strong className="text-gray-900">Location Data:</strong>
                                                    <span className="text-gray-700"> Real-time and background location for attendance verification and workplace presence confirmation.</span>
                                                </div>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-blue-600 font-bold mr-3 text-lg">•</span>
                                                <div>
                                                    <strong className="text-gray-900">Camera Data:</strong>
                                                    <span className="text-gray-700"> Photographs captured during attendance marking or identity verification.</span>
                                                </div>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-blue-600 font-bold mr-3 text-lg">•</span>
                                                <div>
                                                    <strong className="text-gray-900">Audio (if enabled):</strong>
                                                    <span className="text-gray-700"> Used only for video recording features if required by your organization.</span>
                                                </div>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-blue-600 font-bold mr-3 text-lg">•</span>
                                                <div>
                                                    <strong className="text-gray-900">Device Information:</strong>
                                                    <span className="text-gray-700"> Device model, operating system version, app version, and unique device identifiers.</span>
                                                </div>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-blue-600 font-bold mr-3 text-lg">•</span>
                                                <div>
                                                    <strong className="text-gray-900">Usage Data:</strong>
                                                    <span className="text-gray-700"> Log data including login time, attendance records, and activity logs.</span>
                                                </div>
                                            </li>
                                        </ul>
                                    </section>

                                    {/* Section 2 */}
                                    <section id="usage">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
                                            2. How We Use Information
                                        </h2>
                                        <p className="text-gray-700 mb-4 leading-relaxed">
                                            The information we collect is used for the following purposes:
                                        </p>
                                        <ul className="space-y-3">
                                            <li className="flex items-start">
                                                <span className="text-blue-600 font-bold mr-3 text-lg">•</span>
                                                <span className="text-gray-700">To mark employee attendance accurately</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-blue-600 font-bold mr-3 text-lg">•</span>
                                                <span className="text-gray-700">To verify location-based check-in and check-out</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-blue-600 font-bold mr-3 text-lg">•</span>
                                                <span className="text-gray-700">To provide app functionality and technical support</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-blue-600 font-bold mr-3 text-lg">•</span>
                                                <span className="text-gray-700">To improve security and prevent fraudulent activities</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-blue-600 font-bold mr-3 text-lg">•</span>
                                                <span className="text-gray-700">To send notifications regarding attendance status or important updates</span>
                                            </li>
                                        </ul>
                                    </section>

                                    {/* Section 3 */}
                                    <section id="permissions">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
                                            3. Permissions We Use
                                        </h2>
                                        <p className="text-gray-700 mb-4 leading-relaxed">
                                            Our app requires the following permissions to function properly:
                                        </p>
                                        <ul className="space-y-3">
                                            <li className="flex items-start">
                                                <span className="text-blue-600 font-bold mr-3 text-lg">•</span>
                                                <div>
                                                    <strong className="text-gray-900">Location (Fine & Coarse):</strong>
                                                    <span className="text-gray-700"> To verify employee presence at the designated workplace location.</span>
                                                </div>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-blue-600 font-bold mr-3 text-lg">•</span>
                                                <div>
                                                    <strong className="text-gray-900">Camera:</strong>
                                                    <span className="text-gray-700"> For capturing attendance verification photos.</span>
                                                </div>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-blue-600 font-bold mr-3 text-lg">•</span>
                                                <div>
                                                    <strong className="text-gray-900">Microphone:</strong>
                                                    <span className="text-gray-700"> Required only for video capture features (if enabled).</span>
                                                </div>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-blue-600 font-bold mr-3 text-lg">•</span>
                                                <div>
                                                    <strong className="text-gray-900">Storage:</strong>
                                                    <span className="text-gray-700"> To save attendance media files temporarily on your device.</span>
                                                </div>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-blue-600 font-bold mr-3 text-lg">•</span>
                                                <div>
                                                    <strong className="text-gray-900">Notifications:</strong>
                                                    <span className="text-gray-700"> To send attendance alerts, reminders, and important updates.</span>
                                                </div>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-blue-600 font-bold mr-3 text-lg">•</span>
                                                <div>
                                                    <strong className="text-gray-900">Internet:</strong>
                                                    <span className="text-gray-700"> To synchronize attendance data with secure servers.</span>
                                                </div>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-blue-600 font-bold mr-3 text-lg">•</span>
                                                <div>
                                                    <strong className="text-gray-900">System Alert Window:</strong>
                                                    <span className="text-gray-700"> For essential overlay features (if enabled by organization).</span>
                                                </div>
                                            </li>
                                        </ul>
                                    </section>

                                    {/* Section 4 */}
                                    <section id="sharing">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
                                            4. Data Sharing
                                        </h2>
                                        <p className="text-gray-700 mb-4 leading-relaxed">
                                            <strong className="text-gray-900">We do not sell or rent your personal data.</strong> Information may be shared only in the following circumstances:
                                        </p>
                                        <ul className="space-y-3">
                                            <li className="flex items-start">
                                                <span className="text-blue-600 font-bold mr-3 text-lg">•</span>
                                                <div>
                                                    <strong className="text-gray-900">Employer/Organization Administrators:</strong>
                                                    <span className="text-gray-700"> Attendance data is shared with authorized personnel within your organization for workforce management purposes.</span>
                                                </div>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-blue-600 font-bold mr-3 text-lg">•</span>
                                                <div>
                                                    <strong className="text-gray-900">Cloud Service Providers:</strong>
                                                    <span className="text-gray-700"> Authorized third-party service providers for secure data storage and processing (under strict confidentiality agreements).</span>
                                                </div>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-blue-600 font-bold mr-3 text-lg">•</span>
                                                <div>
                                                    <strong className="text-gray-900">Legal Requirements:</strong>
                                                    <span className="text-gray-700"> When required by law, court order, or government regulation.</span>
                                                </div>
                                            </li>
                                        </ul>
                                    </section>

                                    {/* Section 5 */}
                                    <section id="security">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
                                            5. Data Security
                                        </h2>
                                        <p className="text-gray-700 mb-4 leading-relaxed">
                                            We implement industry-standard security measures to protect your data, including:
                                        </p>
                                        <ul className="space-y-3">
                                            <li className="flex items-start">
                                                <span className="text-blue-600 font-bold mr-3 text-lg">•</span>
                                                <span className="text-gray-700">End-to-end encryption for data transmission</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-blue-600 font-bold mr-3 text-lg">•</span>
                                                <span className="text-gray-700">Secure servers with regular security audits</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-blue-600 font-bold mr-3 text-lg">•</span>
                                                <span className="text-gray-700">Role-based access controls</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-blue-600 font-bold mr-3 text-lg">•</span>
                                                <span className="text-gray-700">Regular security updates and vulnerability assessments</span>
                                            </li>
                                        </ul>
                                    </section>

                                    {/* Section 6 */}
                                    <section id="retention">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
                                            6. Data Retention
                                        </h2>
                                        <p className="text-gray-700 leading-relaxed">
                                            Attendance records and related personal data are retained in accordance with your organization's data retention policy and applicable legal requirements. Data may be retained for employment record purposes, audit compliance, or as required by law.
                                        </p>
                                    </section>

                                    {/* Section 7 */}
                                    <section id="rights">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
                                            7. Your Rights
                                        </h2>
                                        <p className="text-gray-700 mb-4 leading-relaxed">
                                            You have the following rights regarding your personal data:
                                        </p>
                                        <ul className="space-y-3 mb-4">
                                            <li className="flex items-start">
                                                <span className="text-blue-600 font-bold mr-3 text-lg">•</span>
                                                <div>
                                                    <strong className="text-gray-900">Access:</strong>
                                                    <span className="text-gray-700"> Request access to your personal data stored in the system.</span>
                                                </div>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-blue-600 font-bold mr-3 text-lg">•</span>
                                                <div>
                                                    <strong className="text-gray-900">Correction:</strong>
                                                    <span className="text-gray-700"> Request correction of inaccurate or incomplete information.</span>
                                                </div>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-blue-600 font-bold mr-3 text-lg">•</span>
                                                <div>
                                                    <strong className="text-gray-900">Deletion:</strong>
                                                    <span className="text-gray-700"> Request deletion of your data (subject to employer policy and legal retention requirements).</span>
                                                </div>
                                            </li>
                                        </ul>
                                        <p className="text-gray-700 leading-relaxed">
                                            To exercise these rights, please contact your organization's HR department or reach out to us directly at the contact information provided below.
                                        </p>
                                    </section>

                                    {/* Section 8 */}
                                    <section id="children">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
                                            8. Children's Privacy
                                        </h2>
                                        <p className="text-gray-700 leading-relaxed">
                                            This application is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal data from a child under 13, we will take steps to delete such information promptly.
                                        </p>
                                    </section>

                                    {/* Section 9 */}
                                    <section id="third-party">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
                                            9. Third-Party Services
                                        </h2>
                                        <p className="text-gray-700 leading-relaxed">
                                            Our app may integrate with third-party services for analytics, cloud storage, or notifications. These services operate independently and have their own privacy policies. We recommend reviewing their privacy policies to understand how they handle your data.
                                        </p>
                                    </section>

                                    {/* Section 10 */}
                                    <section id="changes">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
                                            10. Changes to This Privacy Policy
                                        </h2>
                                        <p className="text-gray-700 leading-relaxed">
                                            We may update this Privacy Policy periodically to reflect changes in our practices, technology, legal requirements, or other factors. When we make significant changes, we will notify users through the app or via email. The updated policy will be posted on this page with a revised "Last Updated" date. We encourage you to review this policy regularly.
                                        </p>
                                    </section>

                                    {/* Section 11 */}
                                    <section id="contact">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
                                            11. Contact Us
                                        </h2>
                                        <p className="text-gray-700 mb-4 leading-relaxed">
                                            If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                                        </p>
                                        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
                                            <div className="space-y-3">
                                                <div>
                                                    <span className="font-semibold text-gray-900">Email:</span>
                                                    <a
                                                        href="mailto:vyomainnovusglobal@gmail.com"
                                                        className="ml-2 text-blue-600 hover:text-blue-800 hover:underline"
                                                    >
                                                        vyomainnovusglobal@gmail.com
                                                    </a>
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-gray-900">App Developer:</span>
                                                    <span className="ml-2 text-gray-700">Vyoma Innovus Global</span>
                                                </div>
                                            </div>
                                            <p className="text-gray-600 text-sm mt-4">
                                                We are committed to addressing your concerns and will respond to inquiries within a reasonable timeframe.
                                            </p>
                                        </div>
                                    </section>
                                </div>

                                {/* Footer */}
                                <div className="bg-gray-50 px-6 sm:px-8 py-6 border-t border-gray-200">
                                    <p className="text-center text-sm text-gray-600 italic">
                                        This Privacy Policy is effective as of the date mentioned above and applies to all users of the Vyoma Attendance App.
                                    </p>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-gray-900 text-white mt-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="text-center">
                            <p className="text-sm text-gray-400">
                                © 2026 Vyoma Innovus Global. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}