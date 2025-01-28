"use client";
// EXAMPLE QUERIES


export type QueryTemplate = {
  name: string;
  query: string;
  type: "sql" | "graphql";
};

export const queries: QueryTemplate[] = [
  {
    name: "KV Operations",
    query: `query($limit: Int, $start: DateTime, $end: DateTime) {
                viewer {
                    accounts(filter: { accountTag: "${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}" }) {
                    requests: kvOperationsAdaptiveGroups(
                        limit: $limit,
                        filter: { datetimeHour_geq: $start, datetimeHour_leq: $end },
                        orderBy: [date_ASC]
                    ) {
                        dimensions {
                        ts: date
                        namespaceId
                        }
                        count
                    }
                }
            }
        }`,
    type: "graphql",
  },
  {
    name: "Turnstile Requests",
    query: `
        query($limit: Int, $start: DateTime, $end: DateTime) {  
           viewer {  
             accounts(filter: { accountTag: "${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}" }) {  
               requests: turnstileAdaptiveGroups(  
                 limit: $limit,  
                 filter: { datetimeHour_geq: $start, datetimeHour_leq: $end },  
                 orderBy: [date_ASC]  
               ) {  
                 dimensions {  
                   ts: date  
                 }  
                 count  
               }  
             }  
           }  
         }  
        `,
    type: "graphql",
  },
  {
    name: "Workflow Invocations",
    query: `
        query($limit: Int, $start: DateTime, $end: DateTime) {  
           viewer {  
             accounts(filter: { accountTag: "${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}" }) {  
               requests: workflowsAdaptiveGroups(  
                 limit: $limit,  
                 filter: { datetimeHour_geq: $start, datetimeHour_leq: $end },  
                 orderBy: [date_ASC]  
               ) {  
                 dimensions {  
                    workflowName  
                    stepName  
                   ts: date  
                 }  
                 count  
               }  
             }  
           }  
         }  
        `,
    type: "graphql",
  },
  {
    name: "R2 Operations",
    query: `
         query($limit: Int, $start: DateTime, $end: DateTime) {  
           viewer {  
             accounts(filter: { accountTag: "${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}" }) {  
               requests: r2OperationsAdaptiveGroups(  
                 limit: $limit,  
                 filter: { datetimeHour_geq: $start, datetimeHour_leq: $end },  
                 orderBy: [date_ASC]  
               ) {  
                 dimensions {  
                    bucketName  
                   ts: date  
                 }  
                 sum {  
                   requests  
                 }  
               }  
             }  
           }  
         }  
        `,
    type: "graphql",
  },
//   {
//     name: "R2 Storage",
//     query: `
//          query($limit: Int, $start: DateTime, $end: DateTime) {  
//            viewer {  
//              accounts(filter: { accountTag: "${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}" }) {  
//                requests: r2StorageAdaptiveGroups(  
//                  limit: $limit,  
//                  filter: { datetimeHour_geq: $start, datetimeHour_leq: $end },  
//                  orderBy: [date_ASC]  
//                ) {  
//                  dimensions {  
//                    bucketName  
//                    ts: date  
//                  }  
//                  max {  
//                    payloadSize  
//                    objectCount  
//                  }  
//                }  
//              }  
//            }
//         `,
//     type: "graphql",
//   },
  {
    name: "D1 Queries",
    query: `
        query($limit: Int, $start: DateTime, $end: DateTime) {  
           viewer {  
             accounts(filter: { accountTag: "${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}" }) {  
               requests: d1AnalyticsAdaptiveGroups(  
                 limit: $limit,  
                 filter: { datetimeHour_geq: $start, datetimeHour_leq: $end },  
                 orderBy: [date_ASC]  
               ) {  
                 dimensions {  
                    databaseId  
                   ts: date  
                 }  
                 count  
               }  
             }  
           }  
         }
        `,
    type: "graphql",
  },
//   {
//     name: "HTTP Requests",
//     query: `
//         query($limit: Int, $start: DateTime, $end: DateTime) {  
//            viewer {  
//              accounts(filter: { accountTag: "${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}" }) {  
//                requests: httpRequestsAdaptiveGroups(  
//                  limit: $limit,  
//                  filter: { datetimeHour_geq: $start, datetimeHour_leq: $end },  
//                  orderBy: [date_ASC]  
//                ) {  
//                  dimensions {  
//                    clientCountryName  
//                     clientRequestPath  
//                    clientRequestHTTPHost  
//                    ts: date  
//                  }  
//                  count  
//                }  
//              }  
//            }  
//          }  
//         `,
//     type: "graphql",
//   },
  {
    name: "AI Gateway Requests",
    query: `
        query($limit: Int, $start: DateTime, $end: DateTime) {  
           viewer {  
             accounts(filter: { accountTag: "${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}" }) {  
               requests: aiGatewayRequestsAdaptiveGroups(  
                 limit: $limit,  
                 filter: { datetimeHour_geq: $start, datetimeHour_leq: $end },  
                 orderBy: [date_ASC]  
               ) {  
                 dimensions {  
                   model  
                   provider  
                   gateway  
                   ts: date  
                 }  
                 count  
               }  
             }  
           }  
         }  
         `,
    type: "graphql",
  },
];
