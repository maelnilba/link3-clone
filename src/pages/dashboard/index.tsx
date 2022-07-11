import type { NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { trpc } from "utils/trpc";
import { z } from "zod";
import { useZorm } from "react-zorm";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";

const FormSchema = z.object({
  slug: z.string().min(3).max(20).regex(/^@/),
});

function ErrorMessage(props: { message: string }) {
  return <div className="text-xs text-red-500">{props.message}</div>;
}

const Index: NextPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const { data: user, isLoading: userLoading } = trpc.useQuery([
    "auth.get-user-info",
  ]);
  const {
    data: dashboard,
    isLoading: treeLoading,
    isError: treeError,
  } = trpc.useQuery(["auth.get-dashboard"]);

  const zo = useZorm("signup", FormSchema, {
    onValidSubmit(e) {
      e.preventDefault();
      alert("Form ok!\n" + JSON.stringify(e.data, null, 2));
    },
  });
  const disabled = zo.validation?.success === false;

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col min-h-screen">
        <div className="flex flex-col px-24 space-y-4">
          <div className="flex flex-row p-8 items-center">
            <div className="flex flew-row flex-1 items-center justify-start space-x-10">
              <div className="text-4xl font-bold">Folllow.</div>
            </div>
            <div className="flex flew-row items-center justify-start space-x-10">
              <div className="flex flex-row space-x-8 items-center">
                <Link href="/info/help" passHref>
                  <button className="btn btn-ghost normal-case font-bold">
                    Help
                  </button>
                </Link>

                <div className="dropdown dropdown-end">
                  {session?.user ? (
                    <label
                      tabIndex={0}
                      className="avatar w-12 hover:cursor-pointer"
                    >
                      <img
                        src={session.user.image || ""}
                        className="w-auto h-auto mask mask-hexagon"
                      />
                    </label>
                  ) : (
                    <label className="avatar placeholder w-12 hover:cursor-pointer">
                      <div className="bg-base-200 rounded-full w-24 mask mask-hexagon"></div>
                    </label>
                  )}
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                  >
                    <li role="button">
                      <a>Settings</a>
                    </li>
                    <li role="button" onClick={() => signOut()}>
                      <a>Log out</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-base-200 p-6 border-solid border-inherit border-x-2 border-y-2 rounded-md flex flex-col">
            <div className="flex flex-row">
              <div className="flex flex-1 flex-row space-x-6">
                {user?.image ? (
                  <div className="avatar w-24">
                    <img
                      src={user.image}
                      className="w-auto h-auto rounded-full"
                    />
                  </div>
                ) : (
                  <div className="avatar placeholder">
                    <div className="bg-base-100 w-24 rounded-full"></div>
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
                    className="btn btn-outline btn-sm normal-case gap-2"
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
              <div className="flex flex-col items-center p-6">
                {!dashboard.tree && (
                  <div className="flex flex-col items-center space-y-6">
                    <div className="text-2xl font-bold">
                      Create your tree first !
                    </div>
                    <form ref={zo.ref}>
                      <div className="flex flex-col space-y-1">
                        <label htmlFor="slug_id" className="text-xs">
                          Your slug
                        </label>
                        <div className="flex flex-row space-x-4">
                          <input
                            id="slug_id"
                            type="text"
                            name={zo.fields.slug()}
                            placeholder="@your_nickname"
                            className="input input-bordered w-full max-w-xs"
                          />

                          <button
                            type="submit"
                            className="btn normal-case"
                            disabled={disabled}
                          >
                            Create
                          </button>
                        </div>
                        {zo.errors.slug((e) => (
                          <ErrorMessage message="Must start with an @, between 3-20 characters" />
                        ))}
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
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