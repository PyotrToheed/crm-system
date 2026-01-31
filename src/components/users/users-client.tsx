"use client";

import { useState } from "react";
import { useI18n } from "@/components/providers/i18n-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Pencil, Trash2, Shield, User as UserIcon } from "lucide-react";
import { createUser, updateUser, deleteUser } from "@/lib/actions/user-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
}

export function UsersClient({ users }: { users: User[] }) {
    const { t } = useI18n();
    const router = useRouter();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "EMPLOYEE" });

    const handleSubmit = async () => {
        try {
            if (editingUser) {
                await updateUser(editingUser.id, formData);
                toast.success(t("common.success_update"));
            } else {
                await createUser(formData);
                toast.success(t("common.success_add"));
            }
            setIsAddOpen(false);
            setEditingUser(null);
            setFormData({ name: "", email: "", password: "", role: "EMPLOYEE" });
            router.refresh();
        } catch (e) {
            toast.error(t("common.error"));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t("users_admin.delete_confirm"))) return;
        try {
            await deleteUser(id);
            toast.success(t("common.success_delete"));
            router.refresh();
        } catch (e) {
            toast.error(t("common.error"));
        }
    };

    const openEdit = (user: User) => {
        setEditingUser(user);
        setFormData({ name: user.name, email: user.email, password: "", role: user.role });
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-sans text-primary">{t("users_admin.title")}</h1>
                    <p className="text-muted-foreground mt-1">{t("users_admin.desc")}</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2" onClick={() => setFormData({ name: "", email: "", password: "", role: "EMPLOYEE" })}>
                            <UserPlus className="h-4 w-4" />
                            {t("users_admin.add")}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t("users_admin.add")}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>{t("users_admin.name")}</Label>
                                <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>{t("users_admin.email")}</Label>
                                <Input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>{t("users_admin.password")}</Label>
                                <Input type="password" value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>{t("users_admin.role")}</Label>
                                <Select value={formData.role} onValueChange={v => setFormData(p => ({ ...p, role: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ADMIN">{t("users_admin.role_admin")}</SelectItem>
                                        <SelectItem value="EMPLOYEE">{t("users_admin.role_employee")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button className="w-full" onClick={handleSubmit}>{t("common.save")}</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("users_admin.name")}</TableHead>
                                <TableHead>{t("users_admin.email")}</TableHead>
                                <TableHead>{t("users_admin.role")}</TableHead>
                                <TableHead className="text-end">{t("customers.actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={user.role === "ADMIN" ? "bg-purple-500/10 text-purple-500 border-purple-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"}>
                                            {user.role === "ADMIN" ? <Shield className="h-3 w-3 mr-1" /> : <UserIcon className="h-3 w-3 mr-1" />}
                                            {user.role === "ADMIN" ? t("users_admin.role_admin") : t("users_admin.role_employee")}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-end">
                                        <Dialog open={editingUser?.id === user.id} onOpenChange={(open) => !open && setEditingUser(null)}>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(user)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>{t("users_admin.edit")}</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label>{t("users_admin.name")}</Label>
                                                        <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>{t("users_admin.email")}</Label>
                                                        <Input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>{t("users_admin.password")}</Label>
                                                        <Input type="password" placeholder={t("users_admin.password_hint")} value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>{t("users_admin.role")}</Label>
                                                        <Select value={formData.role} onValueChange={v => setFormData(p => ({ ...p, role: v }))}>
                                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="ADMIN">{t("users_admin.role_admin")}</SelectItem>
                                                                <SelectItem value="EMPLOYEE">{t("users_admin.role_employee")}</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <Button className="w-full" onClick={handleSubmit}>{t("common.save")}</Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(user.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
