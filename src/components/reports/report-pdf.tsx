"use client";

import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// Define styles
const styles = StyleSheet.create({
    page: {
        padding: 30,
        backgroundColor: "#ffffff",
        fontFamily: "Helvetica",
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: "center",
        color: "#0f172a",
    },
    section: {
        marginBottom: 20,
    },
    header: {
        fontSize: 16,
        marginBottom: 10,
        color: "#2563eb",
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
        paddingBottom: 5,
        fontWeight: "bold",
    },
    row: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
        paddingVertical: 6,
        alignItems: "center",
    },
    cell: {
        flex: 1,
        fontSize: 9,
        color: "#334155",
    },
    boldCell: {
        fontSize: 9,
        fontWeight: "bold",
        color: "#0f172a",
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 30,
    },
    statBox: {
        padding: 12,
        backgroundColor: "#f8fafc",
        borderRadius: 8,
        width: "30%",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#f1f5f9",
    },
    statValue: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#2563eb",
    },
    statLabel: {
        fontSize: 10,
        color: "#64748b",
        marginTop: 4,
    },
    typeBadge: {
        fontSize: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: "#f1f5f9",
        marginRight: 10,
        textAlign: "center",
        width: 60,
    }
});

interface ReportPDFProps {
    data: {
        totals: {
            customers: number;
            leads: number;
            conversionRate: number;
        };
        employeePerformance: {
            name: string;
            activities: number;
            tickets: number;
        }[];
        detailedLogs: {
            type: string;
            subject: string;
            userName: string;
            date: string;
        }[];
    };
    translations: any;
}

export const ReportPDF = ({ data, translations }: ReportPDFProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.title}>{translations.title}</Text>

            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{data.totals.customers}</Text>
                    <Text style={styles.statLabel}>{translations.total_customers}</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{data.totals.leads}</Text>
                    <Text style={styles.statLabel}>{translations.total_leads}</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{data.totals.conversionRate}%</Text>
                    <Text style={styles.statLabel}>{translations.conversion_rate}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.header}>Itemized Activity Audit</Text>
                <View style={[styles.row, { borderBottomColor: "#2563eb", borderBottomWidth: 2, backgroundColor: "#f8fafc" }]}>
                    <Text style={[styles.cell, { flex: 0.8, fontWeight: "bold", paddingLeft: 5 }]}>Date</Text>
                    <Text style={[styles.cell, { flex: 0.8, fontWeight: "bold" }]}>User</Text>
                    <Text style={[styles.cell, { flex: 0.6, fontWeight: "bold" }]}>Action</Text>
                    <Text style={[styles.cell, { flex: 1.8, fontWeight: "bold" }]}>Subject</Text>
                </View>
                {data.detailedLogs.map((log, i) => (
                    <View key={i} style={styles.row}>
                        <Text style={[styles.cell, { flex: 0.8, paddingLeft: 5 }]}>
                            {new Date(log.date).toLocaleDateString()}
                        </Text>
                        <Text style={[styles.cell, { flex: 0.8, fontWeight: "bold" }]}>{log.userName}</Text>
                        <View style={[styles.typeBadge, { flex: 0.6 }]}>
                            <Text>{log.type}</Text>
                        </View>
                        <Text style={[styles.cell, { flex: 1.8 }]}>{log.subject}</Text>
                    </View>
                ))}
            </View>
        </Page>
    </Document>
);
