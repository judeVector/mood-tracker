"use client";

import { PublicKey } from "@solana/web3.js";
import { useMoodtrackerProgram, useMoodtrackerProgramAccount } from "./moodtracker-data-access";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export function MoodtrackerCreate() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { createEntry } = useMoodtrackerProgram();
  const { publicKey } = useWallet();

  const isFormValid = title?.trim() !== "" && description?.trim() !== "";

  const handleSubmit = async () => {
    if (publicKey && isFormValid) {
      try {
        await createEntry.mutateAsync({ title, description, owner: publicKey });
        console.log("Entry created successfully!");
        setTitle("");
        setDescription("");
      } catch (error) {
        console.error("Error creating entry:", error);
      }
    }
  };

  if (!publicKey) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-700">Connect your Wallet to get started.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-xl mx-auto p-6 bg-blue-300 shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-center text-gray-800">Create a Mood Entry</h1>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-4 py-2 text-lg border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full h-32 px-4 py-2 text-lg border-2 border-gray-300 rounded-md shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleSubmit}
        disabled={createEntry.isPending || !isFormValid}
        className={`w-full px-4 py-2 text-lg font-semibold rounded-md shadow-md ${
          createEntry.isPending || !isFormValid
            ? "bg-blue-300 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
      >
        {createEntry.isPending ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
}

export function MoodtrackerList() {
  const { accounts, getProgramAccount } = useMoodtrackerProgram();

  if (getProgramAccount.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info text-center">
        <p>
          Program account not found. Ensure the program is deployed and you are on the correct
          cluster.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {accounts.isLoading ? (
        <div className="flex justify-center items-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data.map((account) => (
            <MoodtrackerCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-semibold">No Accounts Found</h2>
          <p>Create an entry above to get started.</p>
        </div>
      )}
    </div>
  );
}

function MoodtrackerCard({ account }: { account: PublicKey }) {
  const { accountQuery, updateMood, deleteMood } = useMoodtrackerProgramAccount({ account });
  const { publicKey } = useWallet();

  const [description, setDescription] = useState("");
  const title = accountQuery.data?.title;
  const isFormValid = title?.trim() !== "" && description?.trim() !== "";

  const handleSubmit = () => {
    if (publicKey && isFormValid && title) {
      updateMood.mutateAsync({ title, description, owner: publicKey });
    }
  };

  if (!publicKey) {
    return (
      <div className="flex justify-center items-center">
        <p>Connect your Wallet to interact with entries.</p>
      </div>
    );
  }

  return accountQuery.isLoading ? (
    <div className="flex justify-center items-center min-h-[200px]">
      <span className="loading loading-spinner loading-lg text-primary"></span>
    </div>
  ) : (
    <div className="card w-full max-w-xl mx-auto card-bordered border-2 border-gray-200 shadow-lg bg-amber-200 rounded-lg">
      <div className="card-body space-y-4">
        <h2
          className="text-2xl font-bold text-center text-gray-800 cursor-pointer hover:text-blue-500"
          onClick={() => accountQuery.refetch()}
          title="Click to refresh data"
        >
          {title || "No Title Available"}
        </h2>
        <p className="text-center text-gray-600">
          {accountQuery.data?.description || "No description provided."}
        </p>
        <div className="card-actions flex flex-col lg:flex-row justify-center items-center gap-4">
          <textarea
            placeholder="Update the description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="textarea textarea-bordered w-full max-w-sm"
          />
          <button
            onClick={handleSubmit}
            disabled={updateMood.isPending || !isFormValid}
            className={`btn w-full max-w-xs ${
              updateMood.isPending || !isFormValid
                ? "btn-disabled bg-blue-300"
                : "btn-primary hover:bg-blue-600"
            }`}
          >
            {updateMood.isPending ? "Updating..." : "Update"}
          </button>
          <button
            onClick={() => {
              if (title) {
                deleteMood.mutateAsync(title);
              }
            }}
            disabled={deleteMood.isPending}
            className="btn btn-error w-full max-w-xs"
          >
            {deleteMood.isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
