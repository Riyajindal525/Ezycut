import { Outlet } from "react-router-dom";

const OwnerLayout =
  () => {
    return (
      <div>
        <h2>
          Salon Owner Panel
        </h2>

        <Outlet />
      </div>
    );
  };

export default OwnerLayout;