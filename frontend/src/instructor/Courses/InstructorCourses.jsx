import CourseManager from "../../components/portal/CourseManager";
import Layout from "../Utils/Layout";

const InstructorCourses = ({ user }) => (
  <Layout>
    <CourseManager user={user} mode="instructor" />
  </Layout>
);

export default InstructorCourses;
