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
        fontSize: 18,
        marginBottom: 10,
        color: "#2563eb",
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
        paddingBottom: 5,
    },
    row: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
        paddingVertical: 8,
    },
    cell: {
        flex: 1,
        fontSize: 10,
    },
    label: {
        fontWeight: "bold",
        fontSize: 12,
        marginBottom: 5,
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 30,
    },
    statBox: {
        padding: 10,
        backgroundColor: "#f8fafc",
        borderRadius: 5,
        width: "30%",
        alignItems: "center",
    },
    statValue: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#2563eb",
    },
    statLabel: {
        fontSize: 10,
        color: "#64748b",
        marginTop: 5,
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
                <Text style={styles.header}>{translations.employee_performance}</Text>
                <View style={[styles.row, { borderBottomColor: "#2563eb", borderBottomWidth: 2 }]}>
                    <Text style={[styles.cell, { fontWeight: "bold" }]}>{translations.user_name}</Text>
                    <Text style={[styles.cell, { textAlign: "center", fontWeight: "bold" }]}>{translations.activity_count}</Text>
                    <Text style={[styles.cell, { textAlign: "center", fontWeight: "bold" }]}>{translations.ticket_count}</Text>
                </View>
                {data.employeePerformance.map((emp, i) => (
                    <View key={i} style={styles.row}>
                        <Text style={styles.cell}>{emp.name}</Text>
                        <Text style={[styles.cell, { textAlign: "center" }]}>{emp.activities}</Text>
                        <Text style={[styles.cell, { textAlign: "center" }]}>{emp.tickets}</Text>
                    </View>
                ))}
            </View>
        </Page>
    </Document>
);
