// Host creates contests — reuses admin CreateContest component with isHost flag
import CreateContest from "../admin/CreateContest";

export default function HostCreateContest() {
    return <CreateContest isHost={true} />;
}
