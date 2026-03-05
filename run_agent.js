import { AIProjectClient } from "@azure/ai-projects";
import { DefaultAzureCredential } from "@azure/identity";
import dotenv from "dotenv";

dotenv.config();

async function runAgentConversation() {
  const endpoint = process.env.FOUNDRY_ENDPOINT ||
    "https://camilalareste-2498-resource.services.ai.azure.com/api/projects/camilalareste-2498";
  const agentId = process.env.AGENT_ID || "asst_cytuMmbSMhzYIno9NMaS64B8";

  const project = new AIProjectClient(endpoint, new DefaultAzureCredential());

  const agent = await project.agents.getAgent(agentId);
  console.log(`Retrieved agent: ${agent.name}`);

  const thread = await project.agents.threads.create();
  console.log(`Created thread, ID: ${thread.id}`);

  const message = await project.agents.messages.create(thread.id, "user", "Hello Agent");
  console.log(`Created message, ID: ${message.id}`);

  // Create run
  let run = await project.agents.runs.create(thread.id, agent.id);

  // Poll until the run reaches a terminal status
  while (run.status === "queued" || run.status === "in_progress") {
    // Wait for a second
    await new Promise((resolve) => setTimeout(resolve, 1000));
    run = await project.agents.runs.get(thread.id, run.id);
  }

  if (run.status === "failed") {
    console.error(`Run failed: `, run.lastError);
  }

  console.log(`Run completed with status: ${run.status}`);

  // Retrieve messages
  const messages = await project.agents.messages.list(thread.id, { order: "asc" });

  // Display messages
  for await (const m of messages) {
    const content = m.content.find((c) => c.type === "text" && "text" in c);
    if (content) {
      console.log(`${m.role}: ${content.text.value}`);
    }
  }
}

// Main execution
runAgentConversation().catch(error => {
  console.error("An error occurred:", error);
});
