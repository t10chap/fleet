import React from "react";
import { RouteComponentProps } from "react-router";
import { useQuery } from "react-query";
import { AxiosError } from "axios";
import { useErrorHandler } from "react-error-boundary";

import { ISoftwareTitle, formatSoftwareType } from "interfaces/software";
import softwareAPI, {
  ISoftwareTitleResponse,
} from "services/entities/software";

import MainContent from "components/MainContent";
import TableDataError from "components/DataError";
import Spinner from "components/Spinner";

import SoftwareDetailsSummary from "../components/SoftwareDetailsSummary";
import SoftwareTitleDetailsTable from "./SoftwareTitleDetailsTable";

const baseClass = "software-title-details-page";

interface ISoftwareTitleDetailsRouteParams {
  id: string;
}

type ISoftwareTitleDetailsPageProps = RouteComponentProps<
  undefined,
  ISoftwareTitleDetailsRouteParams
>;

const SoftwareTitleDetailsPage = ({
  router,
  routeParams,
}: ISoftwareTitleDetailsPageProps) => {
  // TODO: handle non integer values
  const softwareId = parseInt(routeParams.id, 10);

  const handlePageError = useErrorHandler();

  const {
    data: softwareTitle,
    isLoading: isSoftwareTitleLoading,
    isError: isSoftwareTitleError,
  } = useQuery<ISoftwareTitleResponse, AxiosError, ISoftwareTitle>(
    ["softwareById", softwareId],
    () => softwareAPI.getSoftwareTitle(softwareId),
    {
      select: (data) => data.software_title,
      retry: false,
      refetchOnWindowFocus: false,
      onError: (error) => {
        if (error.status === 403) {
          handlePageError({ status: 403 });
        }
      },
    }
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
        <SoftwareDetailsSummary
          title={softwareTitle.name}
          type={formatSoftwareType(softwareTitle)}
          versions={softwareTitle.versions.length}
          hosts={softwareTitle.hosts_count}
          queryParams={{ software_title_id: softwareId }}
          name={softwareTitle.name}
          source={softwareTitle.source}
        />
        {/* TODO: can we use Card here for card styles */}
        <div className={`${baseClass}__versions-section`}>
          <h2>Versions</h2>
          <SoftwareTitleDetailsTable
            router={router}
            data={softwareTitle.versions}
            isLoading={isSoftwareTitleLoading}
          />
        </div>
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
