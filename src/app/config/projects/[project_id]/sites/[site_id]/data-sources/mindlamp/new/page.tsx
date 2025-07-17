"use client";
import React from 'react';
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import MindlampForm from '@/components/forms/data-sources/mindlamp';

export default function NewMindlampDataSource() {
    const params = useParams();
    const projectId = params.project_id as string;
    const siteId = params.site_id as string;

    return (
        <>
            <div className="p-4 md:p-4 border-b">
                <div className="max-w-screen-xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Button variant="ghost" asChild size="sm" className="mr-2">
                                <Link href={`/config/projects/${projectId}/sites/${siteId}`} className="flex items-center">
                                    <ChevronLeft />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">New MindLAMP Data Source</h1>
                                <p className="text-muted-foreground">
                                    Create a new MindLAMP data source for {siteId}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-6 max-w-5xl flex flex-col">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Image src="/logo/mindLAMP.png" alt="MindLAMP" width={48} height={48} className="rounded" />
                                <div>
                                    <CardTitle>MindLAMP Configuration</CardTitle>
                                    <CardDescription>
                                        Configure a new MindLAMP data source to pull activity and sensor data
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <MindlampForm 
                                project_id={projectId} 
                                site_id={siteId} 
                                instance_name={null} 
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
} 