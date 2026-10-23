"use client"

import { ColumnDef } from "@tanstack/react-table"
// import { Checkbox } from "@/components/ui/checkbox"


import { difficulties, languages } from "@/components/question/question-table/q-config-data"
import { DataTableColumnHeader } from "@/components/data-tables/data-table-column-header"
import { QuestionTableType } from "@/schemas/question-schema"
import DeleteQuestion from "@/components/question/question-table/q-delete"
import QEdit from "@/components/question/question-table/q-edit"


export const columns: ColumnDef<QuestionTableType>[] = [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //       className="translate-y-[2px]"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //       className="translate-y-[2px]"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Question" />
    ),
    cell: ({ row }) => {

      return (
        <div className="flex space-x-2">
          <span className="max-w-[350px] truncate font-medium ">
            {row.getValue("title")}
          </span>
        </div>
      )
    },
  },
  // {
  //   accessorKey: "maxscore",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} name="Maximum Marks" />
  //   ),
  //   cell: ({ row }) => {
  //     return (
  //       <div className="flex space-x-2">
  //         <span className="max-w-[200px] truncate font-medium ">
  //           {row.getValue("maxscore")}
  //         </span>
  //       </div>
  //     )
  //   },
  // },

  {
    accessorKey: "lang",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Language" />
    ),
    cell: ({ row }) => {
      const language = languages.find(
        (language) => language.value === row.getValue("lang")
      )

      if (!language) {
        return null
      }

      return (
        <div className="flex items-center">
          {language.icon && (
            <language.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{language.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "topic",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Topic" />
    ),
    cell: ({ row }) => {
      const topic: string | undefined | null = row.getValue("topic")
      return (
        <div className="flex space-x-2">
          <span className="max-w-[200px] truncate font-medium ">
            {
              topic !== null && topic !== undefined && topic !== "" ? topic : "Not Available"
            }
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "subtopic",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Sub Topic" />
    ),
    cell: ({ row }) => {

      const subtopic: string | undefined | null = row.getValue("subtopic")
      return (
        <div className="flex space-x-2">
          <span className="max-w-[200px] truncate font-medium ">
            {
              subtopic !== null && subtopic !== undefined && subtopic !== "" ? subtopic : "Not Available"
            }
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "difficulty",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Difficulty" />
    ),
    cell: ({ row }) => {
      const difficulty = difficulties.find(
        (difficulty) => difficulty.value === row.getValue("difficulty")
      )

      if (!difficulty) {
        return null
      }

      return (
        <div className="flex w-[130px] items-center">
          {difficulty.icon && (
            <difficulty.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{difficulty.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} name="Actions" />
    ),
    cell: ({ row }) => {
      const qid: string = row.getValue("id")
      if (!qid) {
        return null
      }

      return (
        <div className="flex items-center w-[50px]">
          <span className="flex gap-2">
            <QEdit qid={qid} />
            <DeleteQuestion qid={qid} />
          </span>
        </div>
      )
    },
    enableSorting: false,
    // enableHiding: false,
  },
  // {
  //   id: "actions",
  //   cell: ({ row }) => <div>{row.getValue("id")}</div>,
  //   enableSorting: false,
  //   enableHiding: false,
  // },
]
