import { DashboardNavbar } from "@components/navbar/dashboard-navbar";
import { faCircleUser } from "@fortawesome/free-regular-svg-icons";
import { fa0, faMoneyBillWave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tab } from "@headlessui/react";
import type { GetServerSideProps, NextPage } from "next";
import { DefaultUser } from "next-auth";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { providerIcons } from "pages/sign-in";
import { InferQueryOutput, trpc } from "utils/trpc";
import { CraftListbox } from "@components/listbox";
import { useZorm } from "react-zorm";
import { craftSchema } from "@shared/schemas/craftSchema";
import { Stripe } from "@components/stripe";

const Index: NextPage = () => {
  const { data: accounts } = trpc.useQuery(["auth.get-account"]);
  const { data: session } = useSession();
  return (
    <>
      <Head>
        <title>Account</title>
        <meta name="description" content="Folllow" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-col space-y-4 px-4 sm:px-8 md:px-16 lg:px-24">
          <DashboardNavbar />
          <div className="">
            <Tab.Group vertical manual>
              <div className="flex flex-col gap-6 md:flex-row">
                <Tab.List className="flex min-w-[260px] flex-col space-y-1">
                  <Tab
                    className={({ selected }) =>
                      `${
                        selected ? "" : "btn-ghost"
                      } btn btn-sm flex justify-start gap-2 text-sm font-medium normal-case focus:outline-0`
                    }
                  >
                    <FontAwesomeIcon
                      icon={faCircleUser}
                      className="w-6 text-lg"
                    />
                    Account
                  </Tab>
                  <Tab
                    className={({ selected }) =>
                      `${
                        selected ? "" : "btn-ghost"
                      } btn btn-sm flex justify-start gap-2 text-sm font-medium normal-case focus:outline-0`
                    }
                  >
                    <FontAwesomeIcon
                      icon={faMoneyBillWave}
                      className="w-6 text-lg"
                    />
                    Payment
                  </Tab>
                </Tab.List>
                <Tab.Panels className="flex grow flex-col">
                  <Tab.Panel className="kard p-6">
                    {accounts && session && (
                      <Account accounts={accounts} user={session?.user} />
                    )}
                  </Tab.Panel>
                  <Tab.Panel className="kard p-6">
                    <div className="flex flex-col gap-2">
                      <p className="text-2xl font-bold">Work In Progress.</p>
                    </div>
                  </Tab.Panel>
                </Tab.Panels>
              </div>
            </Tab.Group>
          </div>
        </div>
      </div>
    </>
  );
};

type AccountProps = {
  accounts: InferQueryOutput<"auth.get-account">;
  user:
    | (DefaultUser & {
        id: string;
      })
    | undefined;
};

const Account: React.FC<AccountProps> = ({ accounts, user }) => {
  const currentProvider = accounts[0]?.provider;
  const zo = useZorm("update-craft", craftSchema, {
    onValidSubmit(e) {
      e.preventDefault();
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <p className="text-2xl font-bold">Currents Accounts</p>
      <div>
        <p className="text-xl font-semibold">Current Appearance</p>
        <div className="flex flex-row items-center space-x-2">
          {user?.image ? (
            <div className="avatar h-16 w-16 sm:h-24 sm:w-24">
              <img
                src={user.image}
                className="mask mask-hexagon h-auto w-auto rounded-full"
              />
            </div>
          ) : (
            <div className="avatar placeholder">
              <div
                className={`mask mask-hexagon w-16 rounded-full bg-base-100 sm:w-24`}
              ></div>
            </div>
          )}
          <div className="flex flex-row items-center gap-2 rounded-md bg-black p-1.5 px-3 text-white">
            <FontAwesomeIcon
              icon={providerIcons[currentProvider || 0] || fa0}
              className="text-lg"
            />
            <p className="truncate text-base font-medium">{user?.name}</p>
          </div>
        </div>
        <div className="py-2">
          <button
            className="btn btn-secondary btn-xs normal-case"
            onClick={() => signIn(currentProvider)}
          >
            Re-Sign
          </button>
        </div>
      </div>
      {/* <div>
        <p className="text-xl font-semibold">Business Address</p>
      </div>
      <div>
        <p className="text-xl font-semibold">Craft</p>
        <div className="flex flex-row items-center gap-2">
          <div className="flex max-w-xs grow flex-col">
            <CraftListbox name={zo.fields.craft()} />
          </div>
          <div>
            <button className="btn btn-primary btn-sm normal-case">
              Update
            </button>
          </div>
        </div>
      </div>
      <div>
        <Stripe />
      </div> */}
    </div>
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
