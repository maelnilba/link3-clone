import { DashboardNavbar } from "@components/navbar/dashboard-navbar";
import { ClicksBar } from "@components/analytics/bar";
import { ViewAreas } from "@components/analytics/areas";
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useMemo } from "react";
import { trpc } from "utils/trpc";
import nFormatter from "@components/analytics/nFormatter";
import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "pages/api/auth/[...nextauth]";

type AreasMap = Map<
  string,
  {
    date: Date;
  }[]
>;

type BarMap = Map<
  string,
  {
    date: Date;
    element: string;
  }[]
>;

const Index: NextPage = () => {
  const { data: analytics } = trpc.useQuery(["analytics.get-analytics"]);

  const viewAreas = useMemo(() => {
    const map = analytics?.views.reduce((groups: AreasMap, view) => {
      const date = view.created_at.toISOString().split("T")[0];
      if (!date) return groups;
      if (!groups.has(date)) {
        groups.set(date, []);
      }
      groups.get(date)?.push({ date: view.created_at });
      return groups;
    }, new Map());
    if (!map) return [];
    const result: { close: number; date: string }[] = [];
    map.forEach((value, key) => {
      result.push({
        close: value.length,
        date: key,
      });
    });
    return result;
  }, [analytics]);

  const clicksBar = useMemo(() => {
    const map = analytics?.clicks.reduce((groups: BarMap, click) => {
      const date = new Date(click.created_at.setDate(1))
        .toISOString()
        .split("T")[0];
      if (!date) return groups;
      if (!groups.has(date)) {
        groups.set(date, []);
      }
      groups
        .get(date)
        ?.push({ date: click.created_at, element: click.element });
      return groups;
    }, new Map());
    if (!map) return [];
    const result: { date: string; [key: string]: string }[] = [];
    map.forEach((value, key) => {
      const elements = new Map<string, number>();
      value.forEach((val) => {
        elements.set(val.element, (elements.get(val.element) ?? 0) + 1);
      });

      result.push({
        date: key,
        ...Object.fromEntries(elements),
      });
    });
    return result;
  }, [analytics]);

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-col space-y-4 px-4 sm:px-8 md:px-16 lg:px-24">
          <DashboardNavbar />
          <main>
            {analytics && (
              <div className="grid grid-cols-1  gap-2 md:grid-cols-2">
                <div className="stats overflow-visible shadow-md">
                  <div className="stat">
                    <div className="stat-title">Total Page Views</div>
                    <div className="stat-value">
                      {nFormatter(analytics.totalViews, 1)}
                    </div>
                    <div className="min-w-0 py-2">
                      <ViewAreas data={viewAreas} />
                    </div>
                  </div>
                </div>
                <div className="stats overflow-visible shadow-md">
                  <div className="stat">
                    <div className="stat-title">Total Clicks</div>
                    <div className="stat-value">
                      {nFormatter(analytics.clicks.length, 1)}
                    </div>
                    <div className="min-w-0 py-2">
                      <ClicksBar data={clicksBar} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
  if (!session) {
    return {
      redirect: {
        destination: `/sign-in`,
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default Index;
