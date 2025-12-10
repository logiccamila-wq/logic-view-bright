import { onRequest as __api_assign_role_ts_onRequest } from "C:\\Users\\Camila Lareste\\Documents\\logic-view-bright-main\\logic-view-bright-main\\functions\\api\\assign-role.ts"
import { onRequest as __api_create_user_ts_onRequest } from "C:\\Users\\Camila Lareste\\Documents\\logic-view-bright-main\\logic-view-bright-main\\functions\\api\\create-user.ts"
import { onRequest as __api_db_ts_onRequest } from "C:\\Users\\Camila Lareste\\Documents\\logic-view-bright-main\\logic-view-bright-main\\functions\\api\\db.ts"
import { onRequest as __api_esg_insights_ts_onRequest } from "C:\\Users\\Camila Lareste\\Documents\\logic-view-bright-main\\logic-view-bright-main\\functions\\api\\esg-insights.ts"
import { onRequest as __api_gate_event_ts_onRequest } from "C:\\Users\\Camila Lareste\\Documents\\logic-view-bright-main\\logic-view-bright-main\\functions\\api\\gate-event.ts"
import { onRequest as __api_get_roles_ts_onRequest } from "C:\\Users\\Camila Lareste\\Documents\\logic-view-bright-main\\logic-view-bright-main\\functions\\api\\get-roles.ts"
import { onRequest as __api_install_module_ts_onRequest } from "C:\\Users\\Camila Lareste\\Documents\\logic-view-bright-main\\logic-view-bright-main\\functions\\api\\install-module.ts"
import { onRequest as __api_iot_feed_ts_onRequest } from "C:\\Users\\Camila Lareste\\Documents\\logic-view-bright-main\\logic-view-bright-main\\functions\\api\\iot-feed.ts"
import { onRequest as __api_ledger_blockchain_ts_onRequest } from "C:\\Users\\Camila Lareste\\Documents\\logic-view-bright-main\\logic-view-bright-main\\functions\\api\\ledger-blockchain.ts"
import { onRequest as __api_permissions_matrix_ts_onRequest } from "C:\\Users\\Camila Lareste\\Documents\\logic-view-bright-main\\logic-view-bright-main\\functions\\api\\permissions-matrix.ts"
import { onRequest as __api_predict_maintenance_ts_onRequest } from "C:\\Users\\Camila Lareste\\Documents\\logic-view-bright-main\\logic-view-bright-main\\functions\\api\\predict-maintenance.ts"
import { onRequest as __api_process_cron_ts_onRequest } from "C:\\Users\\Camila Lareste\\Documents\\logic-view-bright-main\\logic-view-bright-main\\functions\\api\\process-cron.ts"
import { onRequest as __api_seed_demo_ts_onRequest } from "C:\\Users\\Camila Lareste\\Documents\\logic-view-bright-main\\logic-view-bright-main\\functions\\api\\seed-demo.ts"
import { onRequest as __api_send_email_ts_onRequest } from "C:\\Users\\Camila Lareste\\Documents\\logic-view-bright-main\\logic-view-bright-main\\functions\\api\\send-email.ts"
import { onRequest as __api_setup_ejg_ts_onRequest } from "C:\\Users\\Camila Lareste\\Documents\\logic-view-bright-main\\logic-view-bright-main\\functions\\api\\setup-ejg.ts"
import { onRequest as __api_supergestor_insights_ts_onRequest } from "C:\\Users\\Camila Lareste\\Documents\\logic-view-bright-main\\logic-view-bright-main\\functions\\api\\supergestor-insights.ts"
import { onRequest as ___middleware_ts_onRequest } from "C:\\Users\\Camila Lareste\\Documents\\logic-view-bright-main\\logic-view-bright-main\\functions\\_middleware.ts"

export const routes = [
    {
      routePath: "/api/assign-role",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_assign_role_ts_onRequest],
    },
  {
      routePath: "/api/create-user",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_create_user_ts_onRequest],
    },
  {
      routePath: "/api/db",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_db_ts_onRequest],
    },
  {
      routePath: "/api/esg-insights",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_esg_insights_ts_onRequest],
    },
  {
      routePath: "/api/gate-event",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_gate_event_ts_onRequest],
    },
  {
      routePath: "/api/get-roles",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_get_roles_ts_onRequest],
    },
  {
      routePath: "/api/install-module",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_install_module_ts_onRequest],
    },
  {
      routePath: "/api/iot-feed",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_iot_feed_ts_onRequest],
    },
  {
      routePath: "/api/ledger-blockchain",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_ledger_blockchain_ts_onRequest],
    },
  {
      routePath: "/api/permissions-matrix",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_permissions_matrix_ts_onRequest],
    },
  {
      routePath: "/api/predict-maintenance",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_predict_maintenance_ts_onRequest],
    },
  {
      routePath: "/api/process-cron",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_process_cron_ts_onRequest],
    },
  {
      routePath: "/api/seed-demo",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_seed_demo_ts_onRequest],
    },
  {
      routePath: "/api/send-email",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_send_email_ts_onRequest],
    },
  {
      routePath: "/api/setup-ejg",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_setup_ejg_ts_onRequest],
    },
  {
      routePath: "/api/supergestor-insights",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_supergestor_insights_ts_onRequest],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_ts_onRequest],
      modules: [],
    },
  ]