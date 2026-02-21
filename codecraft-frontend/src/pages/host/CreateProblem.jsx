// Host creates problems — reuses same CreateProblem component with isHost flag
import CreateProblem from "../admin/CreateProblem";

export default function HostCreateProblem() {
    return <CreateProblem isHost={true} />;
}
