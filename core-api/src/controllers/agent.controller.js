import { runInterviewAnalysisGraph } from "../agents/interviewAnalysisGraph.js";
import { runAgentSchema } from "../validators/agent.validator.js";

export async function runAgent(req, res, next) {
  try {
    const payload = runAgentSchema.parse(req.body);
    const result = await runInterviewAnalysisGraph(payload.input);

    res.json({
      userId: req.user.id,
      ...result
    });
  } catch (error) {
    next(error);
  }
}
