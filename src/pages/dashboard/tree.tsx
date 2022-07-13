import { DashboardNavbar } from "@components/navbar/dashboard-navbar";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Prisma } from "@prisma/client";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { SocialMediaLink, Themes } from "utils/shared";
import { trpc } from "utils/trpc";
import { useMemo, useState } from "react";
import DraggableList from "@components/draggable-list";
import { MyCombobox } from "@components/combobox";

function parsePrisma<T>(json: Prisma.JsonValue) {
  return JSON.parse(json as string) as T;
}

const Index: NextPage = () => {
  const [dataTheme, setDataTheme] = useState("light");
  const {
    data: tree,
    isLoading,
    isError,
  } = trpc.useQuery(["tree.get-my-tree"]);

  const postTree = trpc.useMutation(["tree.post-tree"]);

  const links = useMemo(
    () =>
      tree?.links
        ? parsePrisma<SocialMediaLink[]>(tree?.links)
        : ([] as SocialMediaLink[]),
    [tree]
  );

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex min-h-screen flex-col" data-theme={dataTheme}>
        <div className="flex flex-col space-y-4 px-24">
          <DashboardNavbar />
          <main>
            {tree && (
              <div className="flex flex-col">
                <div className="flex flex-row">
                  <div className="flex flex-1 flex-col">
                    {/* <code>{JSON.stringify(tree, null, 2)}</code> */}
                    <MyCombobox />
                    <DraggableList
                      items={links}
                      renderItem={(item) => {
                        return <div>Prout</div>;
                      }}
                    />
                  </div>
                  <div className="flex flex-col space-y-4">
                    <div className="kard flex flex-row items-center justify-between p-6 ">
                      <Link href="/dashboard/tree/live">
                        <a
                          target="_blank"
                          rel="noreferrer"
                          role="button"
                          className="btn btn-outline gap-2 normal-case"
                        >
                          <FontAwesomeIcon icon={faEye} />
                          Live Preview
                        </a>
                      </Link>
                      <button className="btn gap-2 normal-case">
                        Save changes
                      </button>
                    </div>
                    <div className="kard flex flex-row items-center p-6 ">
                      <div className="flex flex-1 flex-row items-center space-x-4">
                        <div className="self-start">
                          {tree?.image ? (
                            <div className="avatar w-24">
                              <img
                                src={tree.image}
                                className="h-auto w-auto rounded-full"
                              />
                            </div>
                          ) : (
                            <div className="avatar placeholder">
                              <div className="w-24 rounded-full bg-base-100"></div>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col space-y-4">
                          <div className="flex flex-col">
                            <label className="text-xs">Your slug:</label>
                            <input
                              className="input input-bordered w-full max-w-xs"
                              type="text"
                              placeholder="@your_nickname"
                              value={tree.slug}
                              onChange={() => {}}
                            />
                          </div>
                          <div className="flex flex-col">
                            <label className="text-xs">Your bio:</label>
                            <textarea
                              className="textarea textarea-bordered"
                              placeholder="Bio"
                              value={tree.bio || ""}
                              onChange={() => {}}
                            ></textarea>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="kard flex flex-col space-y-4 bg-base-200 p-6">
                      <div className="text-2xl font-bold">Themes</div>
                      <div className="rounded-box grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
                        {Themes.map((theme) => (
                          <div
                            key={theme}
                            onClick={(event) => {
                              event.stopPropagation();
                              setDataTheme(theme);
                            }}
                            data-theme={theme}
                            className="overflow-hidden rounded-lg border border-base-content/20 outline-2 outline-offset-2 outline-base-content hover:border-base-content/40"
                          >
                            <div className="w-full cursor-pointer bg-base-100 font-sans text-base-content">
                              <div className="grid grid-cols-5 grid-rows-3">
                                <div className="col-start-1 row-span-2 row-start-1 bg-base-200"></div>
                                <div className="col-start-1 row-start-3 bg-base-300"></div>
                                <div className="col-span-4 col-start-2 row-span-3 row-start-1 flex flex-col gap-1 bg-base-100 p-2">
                                  <div className="font-bold capitalize">
                                    {theme}
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    <div className="flex aspect-square w-5 items-center justify-center rounded bg-primary lg:w-6">
                                      <div className="text-sm font-bold text-primary-content">
                                        A
                                      </div>
                                    </div>
                                    <div className="flex aspect-square w-5 items-center justify-center rounded bg-secondary lg:w-6">
                                      <div className="text-sm font-bold text-secondary-content">
                                        A
                                      </div>
                                    </div>
                                    <div className="flex aspect-square w-5 items-center justify-center rounded bg-accent lg:w-6">
                                      <div className="text-sm font-bold text-accent-content">
                                        A
                                      </div>
                                    </div>
                                    <div className="flex aspect-square w-5 items-center justify-center rounded bg-neutral lg:w-6">
                                      <div className="text-sm font-bold text-neutral-content">
                                        A
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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

//   type ServerSideProps = InferGetServerSidePropsType<typeof getServerSideProps>;
//   export async function getServerSideProps(context: GetServerSidePropsContext) {
//     return {
//       props: { },
//     };
//   }

export default Index;
