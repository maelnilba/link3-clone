import { MemoizedSocialMediaComponent } from "@components/social-medias-components";
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useEffect, useMemo, useRef } from "react";
import type { SocialMediaLink } from "@shared/socialmedias";
import { trpc } from "utils/trpc";
import { prisma } from "../server/db/client";

interface ServerSideProps {
  tree: {
    slug: string;
    links: Prisma.JsonValue;
    bio: string | null;
    theme: string;
    image: string | null;
    ads_enabled: boolean;
  };
}
let useEffectCancelStrictMode = false;
function parsePrisma<T>(json: Prisma.JsonValue): T {
  if (typeof json === "string") {
    return JSON.parse(json);
  } else return JSON.parse(JSON.stringify(json));
}

const Index: NextPage<ServerSideProps> = ({ tree }) => {
  const links = useMemo(
    () =>
      tree?.links
        ? parsePrisma<SocialMediaLink[]>(tree?.links)
        : ([] as SocialMediaLink[]),
    [tree]
  );

  const adblockHoneyPotRef = useRef<HTMLImageElement | null>(null);

  const postView = trpc.useMutation(["page.post-view"]);
  const postClick = trpc.useMutation(["page.post-click"]);

  useEffect(() => {
    if (!adblockHoneyPotRef.current) return;
    if (useEffectCancelStrictMode === true) return;
    useEffectCancelStrictMode = true;
    const asyncEffect = async () => {
      const hasAdblock = adblockHoneyPotRef.current
        ? adblockHoneyPotRef.current.clientHeight > 0
          ? false
          : true
        : false;
      const geo: NextRequest["geo"] = await (
        await fetch("/api/geo", {
          method: "GET",
          headers: {
            "content-type": "application/json",
          },
        })
      ).json();
      postView.mutate({
        has_adblock: hasAdblock,
        slug: tree.slug,
        geo: {
          city: geo?.city,
          country: geo?.country,
        },
      });
    };

    asyncEffect();
  }, [adblockHoneyPotRef.current]);

  return (
    <>
      <Head>
        <title>{`${tree.slug} | Folllow.link`}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div data-theme={tree.theme}>
        <div className="aw0 absolute">
          <img className="img_ad h-1" ref={adblockHoneyPotRef}></img>
        </div>
        <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-base-100 to-base-300">
          <div className="flex w-full max-w-[760px] flex-col items-center space-y-4 p-10">
            {tree?.image ? (
              <div className="avatar h-24 w-24 drop-shadow-2xl">
                <img src={tree.image} className="h-auto w-auto rounded-full" />
              </div>
            ) : (
              <div className="avatar placeholder drop-shadow-2xl">
                <div className="w-24 rounded-full bg-base-100"></div>
              </div>
            )}
            <div className="space-y-2 text-center">
              <h1 className="text-lg font-bold">{tree.slug}</h1>
              {tree.bio && (
                <h2 className="text-md break-all text-justify">{tree.bio}</h2>
              )}
            </div>
            <div className="flex w-full flex-col items-center space-y-2 py-4 ">
              {links.map((link) => (
                <a
                  className="btn btn-primary btn-lg flex w-full normal-case"
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(event) => {
                    event.stopPropagation();
                    postClick.mutate({
                      slug: tree.slug,
                      element: link.media,
                    });
                  }}
                >
                  <MemoizedSocialMediaComponent
                    media={link.media}
                    className="flew-row relative flex w-full items-center justify-center font-light"
                    iconClassName="absolute left-0 text-2xl"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// TODO: Move to On demand ISR
export const getServerSideProps: GetServerSideProps = async (context) => {
  const {
    query: { slug },
  } = context;

  if (!slug || typeof slug !== "string") {
    return {
      notFound: true,
    };
  }

  if (!slug.startsWith("@")) {
    return {
      redirect: {
        destination: `@${slug}`,
        permanent: true,
      },
    };
  }

  const tree = await prisma.tree.findUnique({
    where: {
      slug: slug,
    },
    select: {
      links: true,
      bio: true,
      theme: true,
      image: true,
      ads_enabled: true,
      slug: true,
    },
  });

  if (!tree) {
    return {
      notFound: true,
    };
  }

  context.res.setHeader(
    "Cache-Control",
    "public, s-maxage=10, stale-while-revalidate=59"
  );

  return {
    props: {
      tree,
    },
  };
};

export default Index;
