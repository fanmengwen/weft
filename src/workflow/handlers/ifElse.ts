import type { WorkflowNodeHandler, WorkflowRunContext } from '../engine/types';
import type { VariablePool } from '../engine/variablePool';
import type { WorkflowCondition } from '../nodes/workflowNodeData';
import { firstUpstreamText } from './llm';

function resolveOperand(
  condition: WorkflowCondition,
  pool: VariablePool,
  incomers: WorkflowRunContext['incomers']
): string {
  if (condition.variable) {
    const [nodeId, key] = condition.variable.split('.');
    const value = pool.getValue(nodeId, key);
    if (value === undefined || value === null) {
      return '';
    }
    return typeof value === 'string' ? value : JSON.stringify(value);
  }
  return firstUpstreamText(pool, incomers);
}

function evaluateCondition(operand: string, condition: WorkflowCondition): boolean {
  switch (condition.operator) {
    case 'contains':
      return operand.includes(condition.value);
    case 'notContains':
      return !operand.includes(condition.value);
    case 'equals':
      return operand === condition.value;
    case 'regex':
      // An invalid pattern throws and fails the node — surfacing the raw
      // SyntaxError beats silently routing to FALSE.
      return new RegExp(condition.value).test(operand);
  }
}

export const ifElseHandler: WorkflowNodeHandler = {
  async run({ data, pool, incomers, log }) {
    const conditions = data.conditions ?? [];
    let result: boolean;

    if (conditions.length === 0) {
      log({ level: 'warn', messageKey: 'workflowMode.log.ifElseNoConditions' });
      result = true;
    } else {
      const outcomes = conditions.map((condition) =>
        evaluateCondition(resolveOperand(condition, pool, incomers), condition)
      );
      result =
        data.conditionLogic === 'or'
          ? outcomes.some(Boolean)
          : outcomes.every(Boolean);
    }

    log({
      level: 'info',
      messageKey: 'workflowMode.log.ifElseResult',
      messageParams: { result: String(result) },
    });

    // Pass the upstream text through so both branches can keep referencing it.
    return {
      outputs: { result, text: firstUpstreamText(pool, incomers) },
      branch: String(result),
    };
  },
};
