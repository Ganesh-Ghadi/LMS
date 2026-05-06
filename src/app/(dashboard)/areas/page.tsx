"use client";

import useSWR from "swr";
import { useMemo, useState, useEffect } from "react";
import { apiGet } from "@/lib/api-client";
import { toast } from "@/lib/toast";
import { Pagination } from "@/components/common/pagination";
import { NonFormTextInput } from "@/components/common/non-form-text-input";
import { AppSelect } from "@/components/common/app-select";
import { FilterBar } from "@/components/common";
import { AppCard } from "@/components/common/app-card";
import { AppButton } from "@/components/common/app-button";
import { DataTable, SortState, Column } from "@/components/common/data-table";
import { DeleteButton } from "@/components/common/delete-button";
import { usePermissions } from "@/hooks/use-permissions";
import { PERMISSIONS } from "@/config/roles";
import { formatDate } from "@/lib/locales";
import { useQueryParamsState } from "@/hooks/use-query-params-state";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { EditButton } from "@/components/common/icon-button";
import { apiDelete } from "@/lib/api-client";
import { AreasResponse, Area } from "@/types/areas";
import { City } from "@/types/cities";

export default function AreasPage() {
  const { pushWithScrollSave } = useScrollRestoration("areas-list");

  const [qp, setQp] = useQueryParamsState({
    page: 1,
    perPage: 10,
    search: "",
    cityId: "",
    sort: "name",
    order: "asc",
  });
  const { page, perPage, search, cityId, sort, order } = qp as unknown as {
    page: number;
    perPage: number;
    search: string;
    cityId: string;
    sort: string;
    order: "asc" | "desc";
  };

  const [searchDraft, setSearchDraft] = useState(search);
  const [cityIdDraft, setCityIdDraft] = useState(cityId);

  useEffect(() => {
    setSearchDraft(search);
  }, [search]);
  useEffect(() => {
    setCityIdDraft(cityId);
  }, [cityId]);

  const filtersDirty = searchDraft !== search || cityIdDraft !== cityId;

  function applyFilters() {
    setQp({
      page: 1,
      search: searchDraft.trim(),
      cityId: cityIdDraft,
    });
  }

  function resetFilters() {
    setSearchDraft("");
    setCityIdDraft("");
    setQp({ page: 1, search: "", cityId: "" });
  }

  const query = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("page", String(page));
    sp.set("perPage", String(perPage));
    if (search) sp.set("search", search);
    if (cityId) sp.set("cityId", cityId);
    if (sort) sp.set("sort", sort);
    if (order) sp.set("order", order);
    return `/api/areas?${sp.toString()}`;
  }, [page, perPage, search, cityId, sort, order]);

  const { data, error, isLoading, mutate } = useSWR<AreasResponse>(
    query,
    apiGet
  );

  const { can } = usePermissions();

  const { data: citiesData } = useSWR<{ data: City[] }>(
    "/api/cities?perPage=100",
    apiGet
  );

  if (error) {
    toast.error((error as Error).message || "Failed to load areas");
  }

  function toggleSort(field: string) {
    if (sort === field) {
      setQp({ order: order === "asc" ? "desc" : "asc" });
    } else {
      setQp({ sort: field, order: "asc" });
    }
  }

  const columns: Column<Area>[] = [
    {
      key: "name",
      header: "Area Name",
      sortable: true,
      cellClassName: "font-medium whitespace-nowrap",
    },
    {
      key: "city",
      header: "City",
      sortable: false,
      accessor: (r) => r.city?.city || "-",
      cellClassName: "whitespace-nowrap",
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      className: "whitespace-nowrap",
      cellClassName: "text-muted-foreground whitespace-nowrap",
      accessor: (r) => formatDate(r.createdAt),
    },
  ];

  const sortState: SortState = { field: sort, order };

  async function handleDelete(id: number) {
    try {
      await apiDelete(`/api/areas/${id}`);
      toast.success("Area deleted");
      await mutate();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <AppCard>
      <AppCard.Header>
        <AppCard.Title>Areas</AppCard.Title>
        <AppCard.Description>Manage application areas.</AppCard.Description>
        {can(PERMISSIONS.CREATE_AREAS) && (
          <AppCard.Action>
            <div className="flex gap-2">
              <AppButton
                size="sm"
                iconName="Plus"
                type="button"
                onClick={() => pushWithScrollSave("/areas/new")}
              >
                Add
              </AppButton>
            </div>
          </AppCard.Action>
        )}
      </AppCard.Header>
      <AppCard.Content>
        <FilterBar title="Search & Filter">
          <NonFormTextInput
            aria-label="Search areas"
            placeholder="Search areas..."
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            containerClassName="w-full"
          />
          <AppSelect
            value={cityIdDraft || "__all"}
            onValueChange={(v) => setCityIdDraft(v === "__all" ? "" : v)}
            placeholder="City"
          >
            <AppSelect.Item value="__all">All Cities</AppSelect.Item>
            {citiesData?.data?.map((city: City) => (
              <AppSelect.Item key={city.id} value={String(city.id)}>
                {city.city}
              </AppSelect.Item>
            ))}
          </AppSelect>
          <AppButton
            size="sm"
            onClick={applyFilters}
            disabled={!filtersDirty && !searchDraft && !cityIdDraft}
            className="min-w-[84px]"
          >
            Filter
          </AppButton>
          {(search || cityId) && (
            <AppButton
              variant="secondary"
              size="sm"
              onClick={resetFilters}
              className="min-w-[84px]"
            >
              Reset
            </AppButton>
          )}
        </FilterBar>
        <DataTable
          columns={columns}
          data={data?.data || []}
          loading={isLoading}
          sort={sortState}
          onSortChange={(s) => toggleSort(s.field)}
          stickyColumns={1}
          renderRowActions={(area) => {
            if (
              !can(PERMISSIONS.EDIT_AREAS) &&
              !can(PERMISSIONS.DELETE_AREAS)
            )
              return null;
            return (
              <div className="flex">
                {can(PERMISSIONS.EDIT_AREAS) && (
                  <EditButton
                    tooltip="Edit Area"
                    aria-label="Edit Area"
                    onClick={() =>
                      pushWithScrollSave(`/areas/${area.id}/edit`)
                    }
                  />
                )}
                {can(PERMISSIONS.DELETE_AREAS) && (
                  <DeleteButton
                    onDelete={() => handleDelete(area.id)}
                    itemLabel="area"
                    title="Delete area?"
                    description={`This will permanently remove ${area.name}. This action cannot be undone.`}
                  />
                )}
              </div>
            );
          }}
        />
      </AppCard.Content>
      <AppCard.Footer className="justify-end">
        <Pagination
          page={data?.page || page}
          totalPages={data?.totalPages || 1}
          total={data?.total}
          perPage={perPage}
          onPerPageChange={(val) => setQp({ page: 1, perPage: val })}
          onPageChange={(p) => setQp({ page: p })}
          showPageNumbers
          maxButtons={5}
          disabled={isLoading}
        />
      </AppCard.Footer>
    </AppCard>
  );
}
