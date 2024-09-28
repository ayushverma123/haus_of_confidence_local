import { GraphQLClient } from "graphql-request";
import { generateAuthenticationString } from "./authentication";
import { serviceEndpoint } from "../../constants/endpoints";
import { ThirdPartyService } from "../../model/ThirdPartyService";
import { EndpointType } from "../../model/EndpointType";

export const gqlClient = () => new GraphQLClient(serviceEndpoint[ThirdPartyService.Boulevard][EndpointType.AdminAPI], {
    headers: {
      Authorization: generateAuthenticationString(),
    },
  })
