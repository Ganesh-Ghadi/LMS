"use client";

import useSWR from "swr";
import { useMemo, useState, useEffect } from "react";
import { apiGet } from "@/lib/api-client";
import { toast } from "@/lib/toast";
import { Pagination } from "@/components/common/pagination";
import { NonFormTextInput } from "@/components/common/non-form-text-input";
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
import { WorksResponse, Work } from "@/types/works";

export default function WorksPage() {
  const { pushWithScrollSave } = useScrollRestoration("works-list");

  const [qp, setQp] = useQueryParamsState({
    page: 1,
    perPage: 10,
    search: "",
    sort: "workName",
    order: "asc",
  });
  const { page, perPage, search, sort, order } = qp as unknown as {
    page: number;
    perPage: number;
    search: string;
    sort: string;
    order: "asc" | "desc";
  };

  const [searchDraft, setSearchDraft] = useState(search);

  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  const filtersDirty = searchDraft !== search;

  function applyFilters() {
    setQp({
      page: 1,
      search: searchDraft.trim(),
    });
  }

  function resetFilters() {
    setSearchDraft("");
    setQp({ page: 1, search: "" });
  }

  const query = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("page", String(page));
    sp.set("perPage", String(perPage));
    if (search) sp.set("search", search);
    if (sort) sp.set("sort", sort);
    if (order) sp.set("order", order);
    return `/api/works?${sp.toString()}`;
  }, [page, perPage, search, sort, order]);

  const { data, error, isLoading, mutate } = useSWR<WorksResponse>(
    query,
    apiGet
  );

  const { can } = usePermissions();

  if (error) {
    toast.error((error as Error).message || "Failed to load works");
  }

  function toggleSort(field: string) {
    if (sort === field) {
      setQp({ order: order === "asc" ? "desc" : "asc" });
    } else {
      setQp({ sort: field, order: "asc" });
    }
  }

  const columns: Column<Work>[] = [
    {
      key: "workName",
      header: "Work Name",
      sortable: true,
      cellClassName: "font-medium whitespace-nowrap",
    },
    {
      key: "rate",
      header: "Rate",
      sortable: true,
      cellClassName: "whitespace-nowrap",
      accessor: (r) => Number(r.rate).toFixed(2),
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
      await apiDelete(`/api/works/${id}`);
      toast.success("Work deleted");
      await mutate();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <AppCard>
      <AppCard.Header>
        <AppCard.Title>Works</AppCard.Title>
        <AppCard.Description>Manage master data for works.</AppCard.Description>
        {can(PERMISSIONS.CREATE_WORKS) && (
          <AppCard.Action>
            <div className="flex gap-2">
              <AppButton
                size="sm"
                iconName="Plus"
                type="button"
                onClick={() => pushWithScrollSave("/works/new")}
              >
                Add
              </AppButton>
            </div>
          </AppCard.Action>
        )}
      </AppCard.Header>
      <AppCard.Content>
        <FilterBar title="Search">
          <NonFormTextInput
            aria-label="Search works"
            placeholder="Search works..."
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            containerClassName="w-full"
          />
          <AppButton
            size="sm"
            onClick={applyFilters}
            disabled={!filtersDirty && !searchDraft}
            className="min-w-[84px]"
          >
            Filter
          </AppButton>
          {search && (
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
          renderRowActions={(s) => {
            if (
              !can(PERMISSIONS.EDIT_WORKS) &&
              !can(PERMISSIONS.DELETE_WORKS)
            )
              return null;
            return (
              <div className="flex">
                {can(PERMISSIONS.EDIT_WORKS) && (
                  <EditButton
                    tooltip="Edit Work"
                    aria-label="Edit Work"
                    onClick={() =>
                      pushWithScrollSave(`/works/${s.id}/edit`)
                    }
                  />
                )}
                {can(PERMISSIONS.DELETE_WORKS) && (
                  <DeleteButton
                    onDelete={() => handleDelete(s.id)}
                    itemLabel="work"
                    title="Delete work?"
                    description={`This will permanently remove ${s.workName}. This action cannot be undone.`}
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
