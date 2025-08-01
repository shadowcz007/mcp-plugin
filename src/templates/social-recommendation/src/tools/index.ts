import './init'
import { createTool } from './base'

import {
  social_info_collector,
  social_topic
} from './config/index'

import { initializeSync } from './initSync'

import { COMMUNITY_INFO, DESCRIPTIONS } from '../data'
import { ToolDefinition } from './base_utils'

const social_info_collector_tool = createTool({
  ...social_info_collector 
} as unknown as ToolDefinition)

const social_topic_tool = createTool({
  ...social_topic
} as unknown as ToolDefinition)

const tools: any = [
  ...Object.values(social_info_collector_tool),
  ...Object.values(social_topic_tool)
]

export { initializeSync, tools } 