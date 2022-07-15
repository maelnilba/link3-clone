import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { InferQueryOutput, trpc } from "utils/trpc";
import { z } from "zod";
import { useZorm } from "react-zorm";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleUser,
  faLayerGroup,
  faLink,
} from "@fortawesome/free-solid-svg-icons";

import { useRouter } from "next/router";

import { DashboardNavbar } from "@components/navbar/dashboard-navbar";
import ErrorLabel from "@components/error-label";

const Index: NextPage = () => {
  const { data: user, isLoading: userLoading } = trpc.useQuery([
    "auth.get-user-info",
  ]);
  const {
    data: dashboard,
    isLoading: treeLoading,
    isError: treeError,
  } = trpc.useQuery(["auth.get-dashboard"]);

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex min-h-screen flex-col">
        <div className="flex flex-col space-y-4 px-24">
          <DashboardNavbar />
          <main>
            <div className=" kard flex flex-col p-6">
              <div className="flex flex-row">
                <div className="flex flex-1 flex-row space-x-6">
                  {user?.image ? (
                    <div className="avatar w-24">
                      <img
                        src={user.image}
                        className="mask mask-hexagon h-auto w-auto rounded-full"
                      />
                    </div>
                  ) : (
                    <div className="avatar placeholder">
                      <div
                        className={`mask mask-hexagon w-24 rounded-full bg-base-100 ${
                          userLoading && "animate-pulse"
                        }`}
                      ></div>
                    </div>
                  )}
                  <div className="grid grid-rows-3">
                    <div className="flex items-end">Welcome back,</div>
                    <div className="text-2xl font-bold">{user?.name || ""}</div>
                    <div className="flex items-start">You look nice today!</div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <Link href="/settings/account" passHref>
                    <a
                      role="button"
                      className="btn btn-outline btn-sm gap-2 normal-case"
                    >
                      <FontAwesomeIcon icon={faCircleUser} />
                      Account
                    </a>
                  </Link>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              {dashboard && (
                <div className="flex flex-col py-6">
                  {!dashboard.tree ? (
                    <DashboardCreate />
                  ) : (
                    <div className="flex flex-row space-x-4">
                      <DashboardTree tree={dashboard.tree} />
                      <DashboardAnalytics />
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

const createTreeSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(20)
    .regex(/^@/, { message: "Must start with a @" }),
});

const DashboardCreate: React.FC = () => {
  const router = useRouter();
  const client = trpc.useContext();
  const createTree = trpc.useMutation(["tree.create-tree"], {
    onSuccess: (data) => {
      client.invalidateQueries(["auth.get-dashboard"]);
      router.push({
        pathname: "/dashboard/tree",
      });
    },
  });

  const checkSlug = trpc.useMutation(["tree.check-slug"]);
  const zo = useZorm("create-tree", createTreeSchema, {
    customIssues: checkSlug.data?.issues,
    onValidSubmit(e) {
      e.preventDefault();
      createTree.mutate({ slug: e.data.slug });
    },
  });
  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="text-2xl font-bold">Create your tree first !</div>
      <form ref={zo.ref}>
        <div className="flex flex-col space-y-1">
          <label htmlFor="slug_id" className="text-xs">
            Your slug:
          </label>
          <div className="flex flex-row space-x-4">
            <input
              id="slug_id"
              type="text"
              name={zo.fields.slug()}
              placeholder="@your_nickname"
              className="input input-bordered w-full max-w-xs"
              onBlur={(event) => {
                const validateBeforeTry = z
                  .string()
                  .regex(/^@/)
                  .safeParse(event.target.value);

                if (validateBeforeTry.success) {
                  checkSlug.mutate({ slug: event.target.value });
                }
              }}
            />
            <button
              type="submit"
              className="btn normal-case"
              disabled={
                zo.validation?.success === false ||
                !!checkSlug.data?.issues.length
              }
            >
              Create
            </button>
          </div>
          {zo.errors.slug((err) => {
            return <ErrorLabel message={err.message} />;
          })}
          <div className="pt-2">
            {zo.errors.slug((err) => {
              return <ErrorLabel message={err.message} />;
            })}
          </div>
        </div>
      </form>
    </div>
  );
};

type DashboardTreeProps = Pick<
  NonNullable<InferQueryOutput<"auth.get-dashboard">>,
  "tree"
>;

const DashboardTree: React.FC<DashboardTreeProps> = (props) => {
  return (
    <div className="kard flex flex-1 flex-row items-center p-6 ">
      <div className="flex flex-1 flex-row items-center space-x-4">
        {props.tree?.image ? (
          <div className="avatar w-24">
            <img
              src={props.tree.image}
              className="h-auto w-auto rounded-full"
            />
          </div>
        ) : (
          <div className="avatar placeholder">
            <div className="w-24 rounded-full bg-base-100"></div>
          </div>
        )}
        <div className="">
          <Link href={`/${props.tree?.slug || "dashboard"}`}>
            <a className="text-xl font-bold hover:opacity-75">
              {props.tree?.slug}
            </a>
          </Link>
          <div>{props.tree?.bio || "No bio yet"}</div>
        </div>
      </div>
      <div className="flex flex-col justify-center space-y-4">
        <Link href="/dashboard/tree" passHref>
          <a
            role="button"
            className="btn btn-outline btn-sm justify-start gap-2 normal-case"
          >
            <FontAwesomeIcon icon={faLayerGroup} />
            Manage
          </a>
        </Link>
        <Link href="/dashboard/tree" passHref>
          <a
            role="button"
            className="btn btn-outline btn-sm justify-start gap-2 normal-case"
          >
            <FontAwesomeIcon icon={faLink} />
            Link
          </a>
        </Link>
      </div>
    </div>
  );
};

const DashboardAnalytics: React.FC = () => {
  return <div className="flex flex-1 flex-col"></div>;
};

//   type ServerSideProps = InferGetServerSidePropsType<typeof getServerSideProps>;
//   export async function getServerSideProps(context: GetServerSidePropsContext) {
//     return {
//       props: { },
//     };
//   }

export default Index;
