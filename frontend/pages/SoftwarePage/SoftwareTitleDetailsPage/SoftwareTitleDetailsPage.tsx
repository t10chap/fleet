/** software/titles/:id */

import React, { useCallback, useContext } from "react";
import { useQuery } from "react-query";
import { useErrorHandler } from "react-error-boundary";
import { RouteComponentProps } from "react-router";
import { AxiosError } from "axios";

import useTeamIdParam from "hooks/useTeamIdParam";

import { AppContext } from "context/app";

import { ISoftwareTitle, formatSoftwareType } from "interfaces/software";
import softwareAPI, {
  ISoftwareTitleResponse,
  IGetSoftwareTitleQueryKey,
} from "services/entities/software";

import Spinner from "components/Spinner";
import TableDataError from "components/DataError";
import MainContent from "components/MainContent";
import TeamsHeader from "components/TeamsHeader";
import Card from "components/Card";

import SoftwareDetailsSummary from "../components/SoftwareDetailsSummary";
import SoftwareTitleDetailsTable from "./SoftwareTitleDetailsTable";
import DetailsNoHosts from "../components/DetailsNoHosts";

const baseClass = "software-title-details-page";

interface ISoftwareTitleDetailsRouteParams {
  id: string;
  team_id?: string;
}

type ISoftwareTitleDetailsPageProps = RouteComponentProps<
  undefined,
  ISoftwareTitleDetailsRouteParams
>;

const SoftwareTitleDetailsPage = ({
  router,
  routeParams,
  location,
}: ISoftwareTitleDetailsPageProps) => {
  const { isPremiumTier, isOnGlobalTeam } = useContext(AppContext);
  const handlePageError = useErrorHandler();

  // TODO: handle non integer values
  const softwareId = parseInt(routeParams.id, 10);

  const {
    currentTeamId,
    teamIdForApi,
    userTeams,
    handleTeamChange,
  } = useTeamIdParam({
    location,
    router,
    includeAllTeams: true,
    includeNoTeam: false,
  });

  const {
    data: softwareTitle,
    isLoading: isSoftwareTitleLoading,
    isError: isSoftwareTitleError,
  } = useQuery<
    ISoftwareTitleResponse,
    AxiosError,
    ISoftwareTitle,
    IGetSoftwareTitleQueryKey[]
  >(
    [{ scope: "softwareById", softwareId, teamId: teamIdForApi }],
    ({ queryKey }) => softwareAPI.getSoftwareTitle(queryKey[0]),
    {
      select: (data) => data.software_title,
      onError: (error) => handlePageError(error),
    }
  );

  const onTeamChange = useCallback(
    (teamId: number) => {
      handleTeamChange(teamId);
    },
    [handleTeamChange]
  );

  const renderContent = () => {
    if (isSoftwareTitleLoading) {
      return <Spinner />;
    }

    if (isSoftwareTitleError) {
      return <TableDataError className={`${baseClass}__table-error`} />;
    }

    if (!softwareTitle) {
      return null;
    }
    return (
      <>
        {isPremiumTier && (
          <TeamsHeader
            isOnGlobalTeam={isOnGlobalTeam}
            currentTeamId={currentTeamId}
            userTeams={userTeams}
            onTeamChange={onTeamChange}
          />
        )}
        <SoftwareDetailsSummary
          title={softwareTitle.name}
          type={formatSoftwareType(softwareTitle)}
          versions={softwareTitle.versions.length}
          hosts={softwareTitle.hosts_count}
          queryParams={{ software_title_id: softwareId, team_id: teamIdForApi }}
          name={softwareTitle.name}
          source={softwareTitle.source}
        />
        {/* TODO - replace ternary logic */}
        {/* {softwareTitle.hosts_count === 0 ? ( */}
        <DetailsNoHosts
          header="Software not detected"
          details={`No host ${teamIdForApi ? "on this team " : ""}has ${
            softwareTitle.name
          } installed.`}
        />
        {/* ) : (
        <Card
          borderRadiusSize="large"
          includeShadow
          className={
            `${baseClass}__versions-section`
          }
        >
            <>
              <h2>Versions</h2>
              <SoftwareTitleDetailsTable
                router={router}
                data={softwareTitle.versions}
                isLoading={isSoftwareTitleLoading}
                teamIdForApi={teamIdForApi}
              />
            </>
        </Card>
          )} */}
      </>
    );
  };

  return (
    <MainContent className={baseClass}>
      <>{renderContent()}</>
    </MainContent>
  );
};

export default SoftwareTitleDetailsPage;
