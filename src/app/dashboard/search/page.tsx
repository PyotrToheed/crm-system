import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { globalSearch } from "@/lib/actions/search-actions";
import { SearchResultsClient } from "@/components/search/search-results-client";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const params = await searchParams;
    const query = params.q || "";

    const results = query ? await globalSearch(query) : { customers: [], leads: [], activities: [], tickets: [] };

    return <SearchResultsClient query={query} results={results} />;
}
