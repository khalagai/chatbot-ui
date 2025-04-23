import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"
import { ContentType, DataListType } from "@/types"
import { IconRobotFace, IconSettings } from "@tabler/icons-react"
import { FC, useContext } from "react"
import { useRouter } from "next/navigation"
import { SidebarCreateButtons } from "./sidebar-create-buttons"
import { SidebarDataList } from "./sidebar-data-list"
import { SidebarSearch } from "./sidebar-search"
import { SidebarCreateItem } from "./sidebar-create-item"
import { SidebarItem } from "./sidebar-item"

interface SidebarContentProps {
  contentType: ContentType
  data: DataListType
  folders: Tables<"folders">[]
}

export const SidebarContent: FC<SidebarContentProps> = ({
  contentType,
  data,
  folders
}) => {
  const { selectedWorkspace } = useContext(ChatbotUIContext)
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredData: any = data.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const renderContent = () => {
    return (
      <div className="flex max-h-[calc(100%-50px)] grow flex-col">
        <div className="mt-2 flex items-center">
          <SidebarCreateButtons
            contentType={contentType}
            hasData={data.length > 0}
          />
        </div>

        <div className="mt-2">
          <SidebarSearch
            contentType={contentType}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>

        <SidebarDataList
          contentType={contentType}
          data={filteredData}
          folders={folders}
        />
      </div>
    )
  }

  const renderSettings = () => {
    return (
      <div className="flex size-full flex-col">
        <div className="flex flex-col space-y-1">
          <div className="flex h-[36px] w-full items-center justify-start px-2">
            <SidebarCreateItem contentType={contentType} />
          </div>

          <div className="flex flex-col space-y-1">
            {data.map(item => (
              <SidebarItem
                key={item.id}
                item={item}
                contentType={contentType}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col space-y-1">
          <div
            className="hover:bg-accent flex h-[36px] w-full cursor-pointer items-center justify-start rounded-lg px-2"
            onClick={() => router.push("/fine-tune")}
          >
            <IconRobotFace className="mr-2 size-5" />
            <div>Fine-tune Model</div>
          </div>
        </div>
      </div>
    )
  }

  if (!selectedWorkspace) return null

  return (
    <div className="flex size-full flex-col">
      {contentType === "settings" ? renderSettings() : renderContent()}
    </div>
  )
}
