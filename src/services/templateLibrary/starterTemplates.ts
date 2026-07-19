import { createDefaultEdge } from '@/constants';
import { NodeType } from '@/lib/types';
import { createTemplateRegistry, type TemplateRegistry } from './registry';
import type { TemplateManifest } from './types';
import { createFlowNode, createTemplate } from './templateFactories';
import { STARTER_WORKFLOW_TEMPLATE_MANIFESTS } from './starterWorkflowTemplates';

/**
 * Featured Chinese starters: compact graphs (5–6 nodes) for readable
 * template-page previews and still usable on the canvas.
 */
export const STARTER_TEMPLATE_MANIFESTS: TemplateManifest[] = [
  createTemplate(
    'leave-approval-flow',
    '请假审批',
    '员工提交请假申请，经主管判断后归档或驳回，覆盖通过与驳回路径。',
    'flowchart',
    ['请假', '审批', '人事', '行政'],
    [
      createFlowNode('la-1', NodeType.START, '开始', 0, 120, 'emerald'),
      createFlowNode('la-2', NodeType.PROCESS, '提交申请', 180, 110, 'blue', {
        subLabel: '选择类型、时间与事由',
      }),
      createFlowNode('la-3', NodeType.DECISION, '请假>3天?', 380, 80, 'amber', {
        subLabel: '超过阈值走总监审批',
      }),
      createFlowNode('la-4', NodeType.PROCESS, '总监审批', 560, 20, 'violet', {
        subLabel: '长假额外确认',
      }),
      createFlowNode('la-5', NodeType.PROCESS, '主管审批', 560, 200, 'blue', {
        subLabel: '短假主管确认',
      }),
      createFlowNode('la-6', NodeType.END, '结束', 760, 110, 'red'),
    ],
    [
      createDefaultEdge('la-1', 'la-2'),
      createDefaultEdge('la-2', 'la-3'),
      createDefaultEdge('la-3', 'la-4', '是'),
      createDefaultEdge('la-3', 'la-5', '否'),
      createDefaultEdge('la-4', 'la-6'),
      createDefaultEdge('la-5', 'la-6'),
    ],
    {
      audience: 'builders',
      useCase: '梳理行政/人事类请假审批，便于落地到 OA 或表单系统',
      launchPriority: 10,
      featured: true,
      difficulty: 'starter',
      outcome: '得到可直接改角色与规则的请假审批主路径图',
      replacementHints: ['请假类型', '主管角色', '天数阈值', '审批人'],
    }
  ),
  createTemplate(
    'order-fulfillment-flow',
    '订单履约',
    '从下单支付到仓配出库、物流签收的电商履约主路径。',
    'flowchart',
    ['订单', '电商', '履约', '物流'],
    [
      createFlowNode('of-1', NodeType.START, '开始', 0, 100, 'emerald'),
      createFlowNode('of-2', NodeType.PROCESS, '下单支付', 180, 90, 'blue', {
        subLabel: '订单与支付回调',
      }),
      createFlowNode('of-3', NodeType.DECISION, '可履约?', 380, 60, 'amber', {
        subLabel: '库存与风控',
      }),
      createFlowNode('of-4', NodeType.PROCESS, '出库发货', 560, 0, 'violet', {
        subLabel: '拣货与揽收',
      }),
      createFlowNode('of-5', NodeType.PROCESS, '取消退款', 560, 180, 'orange', {
        subLabel: '释放库存',
      }),
      createFlowNode('of-6', NodeType.END, '结束', 760, 90, 'red'),
    ],
    [
      createDefaultEdge('of-1', 'of-2'),
      createDefaultEdge('of-2', 'of-3'),
      createDefaultEdge('of-3', 'of-4', '是'),
      createDefaultEdge('of-3', 'of-5', '否'),
      createDefaultEdge('of-4', 'of-6'),
      createDefaultEdge('of-5', 'of-6'),
    ],
    {
      audience: 'builders',
      useCase: '电商 / 零售订单从支付到签收的端到端履约',
      launchPriority: 9,
      featured: true,
      difficulty: 'intermediate',
      outcome: '一张可改仓配与售后入口的订单履约流程图',
      replacementHints: ['库存系统', '仓库节点', '物流商', '退款策略'],
    }
  ),
  createTemplate(
    'user-registration-flow',
    '用户注册登录',
    '新用户注册、校验、登录与异常路径的精简主流程。',
    'flowchart',
    ['注册', '登录', '账号', '产品'],
    [
      createFlowNode('ur-1', NodeType.START, '开始', 0, 100, 'emerald'),
      createFlowNode('ur-2', NodeType.PROCESS, '填写资料', 180, 90, 'blue', {
        subLabel: '邮箱 / 手机号',
      }),
      createFlowNode('ur-3', NodeType.DECISION, '校验通过?', 380, 60, 'amber'),
      createFlowNode('ur-4', NodeType.PROCESS, '创建账号', 560, 0, 'violet'),
      createFlowNode('ur-5', NodeType.PROCESS, '提示修正', 560, 180, 'orange'),
      createFlowNode('ur-6', NodeType.END, '结束', 760, 90, 'red'),
    ],
    [
      createDefaultEdge('ur-1', 'ur-2'),
      createDefaultEdge('ur-2', 'ur-3'),
      createDefaultEdge('ur-3', 'ur-4', '是'),
      createDefaultEdge('ur-3', 'ur-5', '否'),
      createDefaultEdge('ur-4', 'ur-6'),
      createDefaultEdge('ur-5', 'ur-2', '重填'),
    ],
    {
      audience: 'builders',
      useCase: '产品注册登录主路径与失败回退',
      launchPriority: 8,
      featured: true,
      difficulty: 'starter',
      outcome: '可改校验规则与失败提示的注册流程图',
      replacementHints: ['注册字段', '校验规则', '登录方式', '错误文案'],
    }
  ),
  createTemplate(
    'software-release-flow',
    '软件发版',
    '从开发合入到质量门禁、灰度与上线的精简发版路径。',
    'flowchart',
    ['发版', 'CI', '灰度', '上线'],
    [
      createFlowNode('sr-1', NodeType.START, '开始', 0, 100, 'emerald'),
      createFlowNode('sr-2', NodeType.PROCESS, '构建测试', 180, 90, 'blue', {
        subLabel: 'CI 流水线',
      }),
      createFlowNode('sr-3', NodeType.DECISION, '门禁通过?', 380, 60, 'amber'),
      createFlowNode('sr-4', NodeType.PROCESS, '灰度发布', 560, 0, 'violet'),
      createFlowNode('sr-5', NodeType.PROCESS, '回滚修复', 560, 180, 'orange'),
      createFlowNode('sr-6', NodeType.END, '结束', 760, 90, 'red'),
    ],
    [
      createDefaultEdge('sr-1', 'sr-2'),
      createDefaultEdge('sr-2', 'sr-3'),
      createDefaultEdge('sr-3', 'sr-4', '是'),
      createDefaultEdge('sr-3', 'sr-5', '否'),
      createDefaultEdge('sr-4', 'sr-6'),
      createDefaultEdge('sr-5', 'sr-2', '修复后'),
    ],
    {
      audience: 'developers',
      useCase: '研发与平台团队的标准发版路径',
      launchPriority: 7,
      featured: true,
      difficulty: 'intermediate',
      outcome: '可直接改门禁、灰度与回滚策略的上线流程图',
      replacementHints: ['质量门禁', '审批人', '灰度环境', '回滚方式'],
    }
  ),
  ...STARTER_WORKFLOW_TEMPLATE_MANIFESTS,
];

export function createStarterTemplateRegistry(): TemplateRegistry {
  return createTemplateRegistry(STARTER_TEMPLATE_MANIFESTS);
}
