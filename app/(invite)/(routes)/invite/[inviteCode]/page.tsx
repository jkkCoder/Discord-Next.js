import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { redirectToSignIn } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

interface inviteCodePageProps {
    params: {
        inviteCode: string
    }
}

const inviteCodePage =async ({params}: inviteCodePageProps) => {
    const profile = await currentProfile()
    if(!profile) {
        return redirectToSignIn()
    }
    console.log({code: params.inviteCode})
    if(!params.inviteCode){
        return redirect("/")
    }

    const existingServer = await db.server.findFirst({
        where: {
            inviteCode: params.inviteCode,
            members: {
                some: {
                    profileId: profile.id
                }
            }
        }
    })

    console.log({existingServer})

    if(existingServer){
        return redirect(`/servers/${existingServer?.id}`)
    }

    const server = await db.server.update({
        where: {
            inviteCode: params.inviteCode,
        },
        data: {
            members: {
                create: [
                    {
                        profileId: profile.id
                    }
                ]
            }
        }
    })

    console.log({server})

    if(server) {
        return redirect(`/servers/${server.id}`)
    }
    return null
}

export default inviteCodePage