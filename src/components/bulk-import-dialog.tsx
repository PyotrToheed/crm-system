"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, FileSpreadsheet, Download, Check, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface BulkImportDialogProps {
    type: "leads" | "customers";
    trigger?: React.ReactNode;
}

export function BulkImportDialog({ type, trigger }: BulkImportDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState<{ count: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleDownloadTemplate = () => {
        const headers = ["Name", "Email", "Phone", "Company", "Address"];
        const ws = XLSX.utils.aoa_to_sheet([headers]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, `${type}-import-template.xlsx`);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        try {
            const data = await parseFile(file);
            await uploadData(data);
        } catch (error: any) {
            toast.error("Import failed: " + error.message);
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const parseFile = (file: File): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = e.target?.result;
                    const workbook = XLSX.read(data, { type: "binary" });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(sheet);
                    resolve(jsonData);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = (error) => reject(error);
            reader.readAsBinaryString(file);
        });
    };

    const uploadData = async (data: any[]) => {
        if (data.length === 0) throw new Error("File is empty");

        const response = await fetch(`/api/bulk/${type}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Upload failed");
        }

        setStats({ count: result.count });
        toast.success(`Successfully imported ${result.count} ${type}!`);
        router.refresh(); // Refresh page data
        setTimeout(() => {
            setIsOpen(false);
            setStats(null);
        }, 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="gap-2">
                        <FileSpreadsheet className="h-4 w-4" />
                        Import {type === "leads" ? "Leads" : "Customers"}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Import {type === "leads" ? "Leads" : "Customers"}</DialogTitle>
                    <DialogDescription>
                        Upload an Excel or CSV file to bulk create records.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {stats ? (
                        <div className="flex flex-col items-center justify-center py-6 text-green-600 bg-green-50 rounded-lg">
                            <Check className="h-10 w-10 mb-2" />
                            <p className="text-lg font-medium">Imported {stats.count} records!</p>
                        </div>
                    ) : (
                        <>
                            <div
                                className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                                ) : (
                                    <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                                )}
                                <p className="text-sm text-muted-foreground text-center">
                                    {isLoading ? "Processing..." : "Click to select file or drag & drop"}
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx, .xls, .csv"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Supported: .xlsx, .csv</span>
                                <Button
                                    variant="link"
                                    size="sm"
                                    onClick={handleDownloadTemplate}
                                    className="gap-1"
                                >
                                    <Download className="h-3 w-3" />
                                    Download Template
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
