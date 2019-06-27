using System;

namespace Model
{
    public class UserRequest
    {
        public int Id { get; set; }
        //public DateTime Date { get; set; }
        public string UserName { get; set; }
        public string UserTel { get; set; }
        public string RequestHeader { get; set; }
        public string RequestBody { get; set; }
        public double X { get; set; }
        public double Y { get; set; }
    }
}